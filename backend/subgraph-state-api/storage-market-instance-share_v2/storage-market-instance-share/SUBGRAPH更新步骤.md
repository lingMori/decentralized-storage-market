# Subgraph 更新步骤

## 已完成的修改

✅ **schema.graphql** - 已添加业务实体：
- `User` - 用户实体
- `File` - 文件实体
- `StorageNode` - 存储节点实体
- `FileStatus` - 文件状态枚举
- `SystemStats` - 系统统计

✅ **subgraph.yaml** - 已更新 entities 列表

✅ **insta-share-new.ts** - 已准备好完整的事件处理逻辑

---

## 下一步操作

### 1. 运行 Graph Codegen

```bash
cd /Users/ask/Documents/code/github/storage-market/backend/subgraph-state-api/storage-market-instance-share_v2/storage-market-instance-share

# 生成类型定义
graph codegen
```

这将根据 `schema.graphql` 和 `subgraph.yaml` 生成 TypeScript 类型定义。

### 2. 替换事件处理代码

运行 codegen 成功后，将新的处理逻辑复制到主文件：

```bash
# 备份原文件
cp src/insta-share.ts src/insta-share.ts.backup

# 替换为新的处理逻辑
cp src/insta-share-new.ts src/insta-share.ts
```

或者手动复制 `insta-share-new.ts` 的内容到 `insta-share.ts`。

### 3. 编译 Subgraph

```bash
# 编译
graph build
```

### 4. 部署 Subgraph

```bash
# 创建 subgraph（首次）
graph create --node http://localhost:8020 storage-market/instashare

# 部署
graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 storage-market/instashare
```

---

## 新增的查询能力

部署成功后，您可以查询：

### 查询用户信息
```graphql
{
  users(first: 10) {
    id
    address
    totalFiles
    totalNodes
    freeLoad
    maxLoad
    isLocked
    storageNodes {
      nodeId
      totalSpace
      usedSpace
      availableSpace
      isActive
    }
    files {
      cid
      fileName
      size
      storageNodeId
      status
    }
  }
}
```

### 查询文件信息
```graphql
{
  files(where: { status: ACTIVE }) {
    id
    cid
    fileName
    size
    fileType
    storageNodeId
    owner {
      id
      address
    }
    storageNode {
      nodeId
      providerAddress
    }
  }
}
```

### 查询存储节点
```graphql
{
  storageNodes(where: { isActive: true }) {
    id
    nodeId
    owner {
      id
      address
    }
    providerAddress
    totalSpace
    usedSpace
    availableSpace
    files {
      cid
      fileName
      size
    }
  }
}
```

### 查询系统统计
```graphql
{
  systemStats(id: "system") {
    totalUsers
    totalFiles
    activeFiles
    totalStorage
    totalNodes
    activeNodes
  }
}
```

### 查询事件历史
```graphql
{
  fileUploadeds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    owner
    cid
    fileName
    size
    storageNodeId
    blockTimestamp
  }
  
  storageNodeAddeds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    owner
    nodeId
    providerAddress
    totalSpace
    blockTimestamp
  }
}
```

---

## 主要改进

### 1. 业务实体分离
- 事件实体（immutable）：保存原始事件数据
- 业务实体（mutable）：聚合业务状态，支持更新

### 2. 关系映射
- User ↔ Files（一对多）
- User ↔ StorageNodes（一对多）
- File → StorageNode（多对一，可选）

### 3. 统计信息
- 实时统计系统全局数据
- 用户级别的文件和节点统计

### 4. 状态管理
- 文件状态追踪（ACTIVE/INACTIVE/REMOVED）
- 节点激活状态管理

---

## 故障排查

### 如果 codegen 失败

1. 检查 schema.graphql 语法
2. 确保 subgraph.yaml 中的 entities 列表正确
3. 检查 ABI 文件是否存在

### 如果 build 失败

1. 检查 import 语句是否正确
2. 确保所有实体在 schema 中定义
3. 查看具体错误信息

### 如果 deploy 失败

1. 确保 Graph Node 正在运行
2. 检查网络配置
3. 确认合约地址正确

---

## 合约地址配置

当前配置（在 subgraph.yaml 中）：
- Network: `sepolia`
- Address: `0x6f6F93f2a7d198f0AB35ed47c86A37fF6EAb9C58`
- Start Block: `1`

如需修改，编辑 `subgraph.yaml` 的 `source` 部分。

---

## 完成后的验证

1. **检查部署状态**
   ```bash
   curl http://localhost:8030/graphql -d '{"query": "{ indexingStatuses { subgraph synced health } }"}'
   ```

2. **测试查询**
   访问：http://localhost:8000/subgraphs/name/storage-market/instashare/graphql

3. **查看日志**
   ```bash
   docker logs graph-node
   ```

---

## 注意事项

⚠️ **重要**：
- 运行 `graph codegen` 前，确保 schema.graphql 和 subgraph.yaml 已正确修改
- 部署前先在本地测试网测试
- 首次部署需要同步历史数据，可能需要一些时间
- 修改 schema 后需要重新部署 subgraph

---

祝部署顺利！🚀
