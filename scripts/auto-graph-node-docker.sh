#!/usr/bin/env bash
set -euo pipefail

# === 彩色输出 ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Graph Node Docker 自动化部署脚本${NC}"
echo -e "${YELLOW}参考官方端口与配置，安全默认不暴露管理端口${NC}\n"

# === 依赖检查 ===
require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}未检测到 $1，请先安装后再运行本脚本。${NC}"
    exit 1
  fi
}
require_cmd docker

# 选择 compose 命令（优先 docker compose）
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo -e "${RED}未检测到 Docker Compose，请先安装 Docker Compose（v2 或 v1）。${NC}"
  exit 1
fi

# === 端口检测 ===
check_port() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1
  else
    # 兼容没有 lsof 的环境
    (ss -lnt 2>/dev/null || netstat -lnt 2>/dev/null) | grep -q ":${port} "
  fi
}

# === 1) 目录与版本 ===
DEFAULT_BASE="$HOME/graph-node-stack"
DEFAULT_PGDATA="$DEFAULT_BASE/pgdata"
DEFAULT_FILE="$DEFAULT_BASE/docker-compose.graphnode.yml"
DEFAULT_IMAGE_TAG="latest"  # 也可使用具体版本如 v0.40.1

echo -e "${YELLOW}设置安装目录与版本（按回车使用默认）...${NC}"
read -rp "基础目录 [${DEFAULT_BASE}]: " BASE_DIR
BASE_DIR="${BASE_DIR:-$DEFAULT_BASE}"
read -rp "PostgreSQL 数据目录 [${DEFAULT_PGDATA}]: " PGDATA
PGDATA="${PGDATA:-$DEFAULT_PGDATA}"
read -rp "Compose 文件路径 [${DEFAULT_FILE}]: " COMPOSE_FILE
COMPOSE_FILE="${COMPOSE_FILE:-$DEFAULT_FILE}"
read -rp "Graph Node 镜像标签（latest 或 v0.xx.x） [${DEFAULT_IMAGE_TAG}]: " IMAGE_TAG
IMAGE_TAG="${IMAGE_TAG:-$DEFAULT_IMAGE_TAG}"

mkdir -p "$BASE_DIR" "$PGDATA"

# === 2) 端口配置（默认安全地将管理端口绑到 127.0.0.1） ===
DEF_HTTP=12700
DEF_WS=12701
DEF_ADMIN=12720
DEF_STATUS=12730
DEF_METRICS=12740

echo -e "${YELLOW}配置端口（按回车使用默认）...${NC}"
read -rp "GraphQL HTTP 端口（查询） [${DEF_HTTP}]: " P_HTTP
P_HTTP="${P_HTTP:-$DEF_HTTP}"
read -rp "GraphQL WS 端口（订阅） [${DEF_WS}]: " P_WS
P_WS="${P_WS:-$DEF_WS}"
read -rp "JSON-RPC 管理端口（仅本机） [${DEF_ADMIN}]: " P_ADMIN
P_ADMIN="${P_ADMIN:-$DEF_ADMIN}"
read -rp "Indexing Status API 端口（仅本机） [${DEF_STATUS}]: " P_STATUS
P_STATUS="${P_STATUS:-$DEF_STATUS}"
read -rp "Prometheus 指标端口（仅本机） [${DEF_METRICS}]: " P_METRICS
P_METRICS="${P_METRICS:-$DEF_METRICS}"

for port in "$P_HTTP" "$P_WS" "$P_ADMIN" "$P_STATUS" "$P_METRICS"; do
  if check_port "$port"; then
    echo -e "${RED}端口 ${port} 已被占用。请更换端口或释放后重试。${NC}"
    exit 1
  fi
done
echo -e "${GREEN}端口检测通过√${NC}"

# === 3) 数据库配置 ===
DEFAULT_PG_USER="graph-node"
DEFAULT_PG_DB="graph-node"

echo -e "${YELLOW}配置 PostgreSQL...${NC}"
read -rp "PostgreSQL 用户名 [${DEFAULT_PG_USER}]: " PG_USER
PG_USER="${PG_USER:-$DEFAULT_PG_USER}"
read -rp "PostgreSQL 数据库名 [${DEFAULT_PG_DB}]: " PG_DB
PG_DB="${PG_DB:-$DEFAULT_PG_DB}"

gen_pw() {
  if command -v openssl >/dev/null 2>&1; then openssl rand -hex 16; else echo "let-me-in"; fi
}
read -rp "PostgreSQL 密码（留空自动生成）: " PG_PASSWORD
PG_PASSWORD="${PG_PASSWORD:-$(gen_pw)}"
echo -e "${GREEN}将使用自动生成/提供的密码。${NC}"

# === 4) IPFS 与以太坊 RPC ===
# 注意：容器中访问宿主机服务，推荐使用 host.docker.internal（Linux 需 extra_hosts 支持）
DEFAULT_IPFS="http://host.docker.internal:12601"  # 你的 IPFS 脚本默认把 5001 映射到了 12801
echo -e "${YELLOW}配置 IPFS API 与链 RPC...${NC}"
read -rp "IPFS API 地址 [${DEFAULT_IPFS}]: " IPFS_URL
IPFS_URL="${IPFS_URL:-$DEFAULT_IPFS}"

# 以太坊/兼容 EVM RPC 映射：NETWORK:[CAPS]:URL
# 例如 mainnet:archive,traces:https://mainnet.infura.io/v3/KEY
read -rp "链网络名（如 mainnet / sepolia / polygon / bsc 等）: " ETH_NET
ETH_NET="${ETH_NET:-mainnet}"
read -rp "RPC 能力（可留空，常见：archive,traces）: " ETH_CAPS
CAPS_PART=""
if [[ -n "${ETH_CAPS}" ]]; then CAPS_PART="${ETH_NET}:${ETH_CAPS}:"; else CAPS_PART="${ETH_NET}:"; fi
read -rp "RPC URL（如 https://... 或 http://host.docker.internal:8545）: " ETH_URL
if [[ -z "${ETH_URL}" ]]; then
  echo -e "${RED}RPC URL 不能为空。${NC}"; exit 1
fi
ETHEREUM_ARG="${CAPS_PART}${ETH_URL}"

# === 5) 节点标识与日志 ===
DEFAULT_NODE_ID="index-node-1"
DEFAULT_GRAPH_LOG="info"
read -rp "Graph Node 节点 ID [${DEFAULT_NODE_ID}]: " NODE_ID
NODE_ID="${NODE_ID:-$DEFAULT_NODE_ID}"
read -rp "GRAPH_LOG 等级（error|warn|info|debug|trace） [${DEFAULT_GRAPH_LOG}]: " GRAPH_LOG
GRAPH_LOG="${GRAPH_LOG:-$DEFAULT_GRAPH_LOG}"

# === 6) 是否移除已有同名栈 ===
STACK_NAME="graphnode"
echo -e "${YELLOW}检查是否存在旧的 ${STACK_NAME} 栈...${NC}"
if $COMPOSE -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
  read -rp "检测到已有 ${STACK_NAME} 栈定义，是否先停止并移除？[Y/n]: " rm_old
  rm_old="${rm_old:-Y}"
  if [[ "$rm_old" =~ ^[Yy]$ ]]; then
    $COMPOSE -f "$COMPOSE_FILE" down -v || true
    echo -e "${GREEN}已移除旧栈√${NC}"
  fi
fi

# === 7) 生成 docker-compose 文件 ===
echo -e "${YELLOW}写入 Compose 文件: ${COMPOSE_FILE}${NC}"
mkdir -p "$(dirname "$COMPOSE_FILE")"

cat > "$COMPOSE_FILE" <<'EOF'
version: "3.8"
services:
  postgres:
    image: postgres:14
    container_name: graph-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: ${PG_DB}
    volumes:
      - ${PGDATA}:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER} -d ${PG_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10

  graph-node:
    image: graphprotocol/graph-node:${IMAGE_TAG}
    container_name: graph-node
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    environment:
      # PostgreSQL 连接
      postgres_host: postgres
      postgres_user: ${PG_USER}
      postgres_pass: ${PG_PASSWORD}
      postgres_db: ${PG_DB}
      # IPFS 与链 RPC
      ipfs: ${IPFS_URL}
      ethereum: ${ETHEREUM_ARG}
      # 标识与日志
      node_id: ${NODE_ID}
      GRAPH_LOG: ${GRAPH_LOG}
    # 为了让容器内可解析 host.docker.internal（Linux）
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      # 对外提供查询（可按需改成 127.0.0.1: 映射，仅内网可用）
      - "${P_HTTP}:8000"
      - "${P_WS}:8001"
      # 安全起见：管理/状态/指标仅绑定到本机
      - "127.0.0.1:${P_ADMIN}:8020"
      - "127.0.0.1:${P_STATUS}:8030"
      - "127.0.0.1:${P_METRICS}:8040"
    # 可选：提高打开文件数等（按需开启）
    # ulimits:
    #   nofile:
    #     soft: 65536
    #     hard: 65536
EOF

# === 8) 写入 .env 变量（Compose 自动引用） ===
ENV_FILE="${COMPOSE_FILE%.yml}.env"
cat > "$ENV_FILE" <<EOF
PG_USER=${PG_USER}
PG_PASSWORD=${PG_PASSWORD}
PG_DB=${PG_DB}
PGDATA=${PGDATA}
IMAGE_TAG=${IMAGE_TAG}
IPFS_URL=${IPFS_URL}
ETHEREUM_ARG=${ETHEREUM_ARG}
NODE_ID=${NODE_ID}
GRAPH_LOG=${GRAPH_LOG}
P_HTTP=${P_HTTP}
P_WS=${P_WS}
P_ADMIN=${P_ADMIN}
P_STATUS=${P_STATUS}
P_METRICS=${P_METRICS}
EOF

echo -e "${GREEN}Compose 与 .env 写入完成√${NC}"

# === 9) 启动 ===
echo -e "${YELLOW}启动服务...${NC}"
$COMPOSE -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

echo -e "${YELLOW}等待 graph-node 日志输出关键端口...${NC}"
sleep 5
docker logs --tail 50 graph-node || true

# === 10) 成功信息与提示 ===
echo -e "${GREEN}\nGraph Node 部署完成！${NC}"
echo -e "${GREEN}========================= 访问信息 =========================${NC}"
echo "GraphQL（HTTP 查询）:   http://localhost:${P_HTTP}"
echo "GraphQL（WS 订阅）:     ws://localhost:${P_WS}"
echo "JSON-RPC 管理（本机）:  http://127.0.0.1:${P_ADMIN}"
echo "Status API（本机）:     http://127.0.0.1:${P_STATUS}/graphql"
echo "Prometheus（本机）:     http://127.0.0.1:${P_METRICS}/metrics"
echo -e "${GREEN}============================================================${NC}"
echo -e "${YELLOW}安全提示：请勿对公网暴露 8020/8030/数据库 等管理/内部端口。${NC}"
echo -e "\n${YELLOW}常用命令：${NC}"
echo "  查看日志:     docker logs -f graph-node"
echo "  查看状态:     curl -s http://127.0.0.1:${P_STATUS}/graphql | head -n 1 || true"
echo "  查看指标:     curl -s http://127.0.0.1:${P_METRICS}/metrics | head -n 5 || true"
echo "  关闭并清理:   ${COMPOSE} -f ${COMPOSE_FILE} --env-file ${ENV_FILE} down"
echo "  彻底清理数据: rm -rf ${PGDATA}"
