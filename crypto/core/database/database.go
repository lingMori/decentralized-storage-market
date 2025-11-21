package database

import (
	"context"
	"fmt"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p/core/protocol"
	"sort"
	"sync"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/documentstore"
	icore "github.com/ipfs/interface-go-ipfs-core"
	config "github.com/ipfs/kubo/config"
	"github.com/ipfs/kubo/core"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/event"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/mitchellh/mapstructure"
	"go.uber.org/zap"

	"github.com/mrusme/superhighway84/cache"
	"github.com/mrusme/superhighway84/models"
)

type Database struct {
	ctx              context.Context // 上下文对象
	ConnectionString string          // 数据库连接字符串
	URI              string          // 数据库URI
	CachePath        string          // 缓存路径
	Cache            *cache.Cache    // 缓存对象

	Logger *zap.Logger // 日志记录器

	IPFSNode    *core.IpfsNode // IPFS节点
	IPFSCoreAPI icore.CoreAPI  // IPFS CoreAPI

	OrbitDB orbitdb.OrbitDB       // OrbitDB实例
	Store   orbitdb.DocumentStore // DocumentStore对象
	Events  event.Subscription    // 事件订阅
}

// 初始化数据库连接和OrbitDB实例
func (db *Database) init() error {
	var err error

	ctx := context.Background()

	db.Logger.Debug("initializing NewOrbitDB ...")
	// 创建OrbitDB实例
	db.OrbitDB, err = orbitdb.NewOrbitDB(ctx, db.IPFSCoreAPI, &orbitdb.NewOrbitDBOptions{
		Directory: &db.CachePath,
		Logger:    db.Logger,
	})
	if err != nil {
		return err
	}

	ac := &accesscontroller.CreateAccessControllerOptions{
		Access: map[string][]string{
			"write": {
				"*",
			},
		},
	}

	storetype := "docstore"
	db.Logger.Debug("initializing OrbitDB.Docs ...")
	// 打开或创建指定名称的DocumentStore
	db.Store, err = db.OrbitDB.Docs(ctx, db.ConnectionString, &orbitdb.CreateDBOptions{
		AccessController:  ac,
		StoreType:         &storetype,
		StoreSpecificOpts: documentstore.DefaultStoreOptsForMap("id"),
		Timeout:           time.Second * 600,
	})
	if err != nil {
		return err
	}

	db.Logger.Debug("subscribing to EventBus ...")
	// 订阅Store的事件
	db.Events, err = db.Store.EventBus().Subscribe(new(stores.EventReady))
	return err
}

// 获取当前节点的ID
func (db *Database) GetOwnID() string {
	return db.OrbitDB.Identity().ID
}

// 获取当前节点的公钥
func (db *Database) GetOwnPubKey() crypto.PubKey {
	pubKey, err := db.OrbitDB.Identity().GetPublicKey()
	if err != nil {
		return nil
	}

	return pubKey
}

// 连接到其他节点
func (db *Database) connectToPeers() error {
	var wg sync.WaitGroup // 定义 WaitGroup，用于等待所有连接操作完成

	peerInfos, err := config.DefaultBootstrapPeers() // 获取默认的引导节点信息
	if err != nil {
		return err
	}

	wg.Add(len(peerInfos)) // 将 WaitGroup 的计数器设置为引导节点的数量
	for _, peerInfo := range peerInfos {
		go func(peerInfo *peer.AddrInfo) { // 并发地连接每个引导节点
			defer wg.Done()                                          // 在函数结束时减少 WaitGroup 的计数器
			err := db.IPFSCoreAPI.Swarm().Connect(db.ctx, *peerInfo) // 使用 IPFS CoreAPI 连接到引导节点
			if err != nil {
				db.Logger.Error("failed to connect", zap.String("peerID", peerInfo.ID.String()), zap.Error(err)) // 连接失败时记录错误日志
			} else {
				db.Logger.Debug("connected!", zap.String("peerID", peerInfo.ID.String())) // 连接成功时记录日志
			}
		}(&peerInfo)
	}
	wg.Wait() // 等待所有连接操作完成
	return nil
}

// 创建新的 Database 实例
func NewDatabase(ctx context.Context, dbConnectionString string, dbCache string, cch *cache.Cache, logger *zap.Logger) (*Database, error) {
	var err error

	db := new(Database)                      // 创建 Database 实例
	db.ctx = ctx                             // 设置上下文对象
	db.ConnectionString = dbConnectionString // 设置数据库连接字符串
	db.CachePath = dbCache                   // 设置缓存路径
	db.Cache = cch                           // 设置缓存对象
	db.Logger = logger                       // 设置日志记录器

	defaultPath, err := config.PathRoot() // 获取默认路径
	if err != nil {
		return nil, err
	}

	if err := setupPlugins(defaultPath); err != nil { // 设置插件
		return nil, err
	}

	db.IPFSCoreAPI, db.IPFSNode, err = createNode(ctx, defaultPath) // 创建 IPFS 节点和 IPFS CoreAPI 实例
	if err != nil {
		return nil, err
	}

	return db, nil // 返回新创建的 Database 实例和 nil 错误
}

// 连接到其他节点并初始化数据库连接
func (db *Database) Connect(onReady func(address string)) error {
	var err error

	// 连接到其他节点
	db.Logger.Info("connecting to peers ...")
	err = db.connectToPeers() // 调用 connectToPeers 方法连接到其他节点
	if err != nil {
		db.Logger.Error("failed to connect: %s", zap.Error(err))
	} else {
		db.Logger.Debug("connected to peer!")
	}

	// 初始化数据库连接
	db.Logger.Info("initializing database connection ...")
	err = db.init() // 调用 init 方法初始化数据库连接
	if err != nil {
		db.Logger.Error("%s", zap.Error(err))
		return err
	}

	db.Logger.Info("running ...")

	go func() {
		// 处理事件
		for {
			for ev := range db.Events.Out() { // 从 Events 中获取事件
				db.Logger.Debug("got event", zap.Any("event", ev))
				switch ev.(type) {
				case stores.EventReady: // 当事件类型是 EventReady 时
					db.URI = db.Store.Address().String() // 获取 Store 的地址作为 URI
					onReady(db.URI)                      // 调用 onReady 回调函数，并传入 URI
					continue
				}
			}
		}
	}()

	err = db.Store.Load(db.ctx, -1) // 调用 Store 的 Load 方法加载数据
	if err != nil {
		db.Logger.Error("%s", zap.Error(err))
		return err
	}

	db.Logger.Debug("connect done")
	return nil
}

// 断开数据库连接
func (db *Database) Disconnect() {
	db.Events.Close()  // 关闭 Events 订阅
	db.Store.Close()   // 关闭 Store
	db.OrbitDB.Close() // 关闭 OrbitDB
}

// 提交文章
func (db *Database) SubmitArticle(article *models.Article) error {
	entity, err := structToMap(*article)
	if err != nil {
		return err
	}
	entity["type"] = "article"

	_, err = db.Store.Put(db.ctx, entity)
	return err
}

// 根据ID获取文章
func (db *Database) GetArticleByID(id string) (models.Article, error) {
	entity, err := db.Store.Get(db.ctx, id, &iface.DocumentStoreGetOptions{CaseInsensitive: false})
	if err != nil {
		return models.Article{}, err
	}

	var article models.Article
	err = mapstructure.Decode(entity[0], &article)
	if err != nil {
		return models.Article{}, err
	}

	return article, nil
}

// 获取文章列表
func (db *Database) ListArticles() ([]*models.Article, []*models.Article, error) {
	var articles []*models.Article
	var articlesMap = make(map[string]*models.Article)

	_, err := db.Store.Query(db.ctx, func(e interface{}) (bool, error) {
		entity := e.(map[string]interface{})
		if entity["type"] == "article" {
			var article models.Article
			err := mapstructure.Decode(entity, &article)
			if err == nil {
				if entity["in-reply-to-id"] != nil {
					article.InReplyToID = entity["in-reply-to-id"].(string)
				}
				db.Cache.LoadArticle(&article)
				articles = append(articles, &article)
				articlesMap[article.ID] = articles[(len(articles) - 1)]
			}
			return true, err
		}
		return false, nil
	})
	if err != nil {
		return articles, nil, err
	}

	sort.SliceStable(articles, func(i, j int) bool {
		return articles[i].Date > articles[j].Date
	})

	var articlesRoots []*models.Article
	for i := 0; i < len(articles); i++ {
		if articles[i].InReplyToID != "" {
			inReplyTo := articles[i].InReplyToID
			if _, exist := articlesMap[inReplyTo]; exist {

				(*articlesMap[inReplyTo]).Replies =
					append((*articlesMap[inReplyTo]).Replies, articles[i])
				(*articlesMap[inReplyTo]).LatestReply = articles[i].Date
				continue
			}
		}
		articlesRoots = append(articlesRoots, articles[i])
	}

	sort.SliceStable(articlesRoots, func(i, j int) bool {
		iLatest := articlesRoots[i].LatestReply
		if iLatest <= 0 {
			iLatest = articlesRoots[i].Date
		}

		jLatest := articlesRoots[j].LatestReply
		if jLatest <= 0 {
			jLatest = articlesRoots[j].Date
		}

		return iLatest > jLatest
	})

	return articles, articlesRoots, nil
}

// 连接到目标节点
func connectToPeer(ctx context.Context, host host.Host, targetAddr string) error {
	// 解析目标地址
	pi, err := peer.AddrInfoFromString(targetAddr)
	if err != nil {
		return err
	}

	// 连接到目标节点
	err = host.Connect(ctx, *pi)
	if err != nil {
		return err
	}

	return nil
}

// 发送数据到目标节点
func sendData(host host.Host, targetAddr string, data string) error {
	// 找到目标节点的Peer ID
	pi, err := peer.AddrInfoFromString(targetAddr)
	if err != nil {
		return err
	}

	// 通过目标节点的Peer ID建立一个流
	s, err := host.NewStream(context.Background(), pi.ID, "/my-protocol/1.0")
	if err != nil {
		return err
	}

	// 在流上发送数据
	_, err = s.Write([]byte(data))
	if err != nil {
		return err
	}

	return nil
}

func SetStreamHandler(node *core.IpfsNode, protocolID protocol.ID) {
	node.PeerHost.SetStreamHandler(protocolID, func(s network.Stream) {
		// 创建一个缓冲区来存储接收到的数据
		buf := make([]byte, 1024)

		// 读取数据
		n, err := s.Read(buf)
		if err != nil {
			fmt.Printf("Failed to read data: %s\n", err)
			return
		}

		// 打印接收到的数据
		fmt.Printf("Received data: %s\n", buf[:n])

		// 关闭流
		s.Close()
	})
}
