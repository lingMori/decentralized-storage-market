#!/bin/bash

# IPFS Docker 部署脚本
# 此脚本用于部署和配置IPFS Docker容器

# 显示彩色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker是否已安装
echo -e "${YELLOW}正在检查Docker是否已安装...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Docker未安装，请先安装Docker后再运行此脚本。"
    echo "可以参考Docker官方文档: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}Docker已安装√${NC}"

# 设置目录
echo -e "${YELLOW}设置IPFS数据目录...${NC}"
# 默认目录
DEFAULT_STAGING_DIR="$HOME/ipfs/staging"
DEFAULT_DATA_DIR="$HOME/ipfs/data"

# 询问用户是否使用默认目录
read -p "是否使用默认目录? ($DEFAULT_STAGING_DIR 和 $DEFAULT_DATA_DIR) [Y/n]: " use_default
use_default=${use_default:-Y}

if [[ $use_default =~ ^[Yy]$ ]]; then
    ipfs_staging=$DEFAULT_STAGING_DIR
    ipfs_data=$DEFAULT_DATA_DIR
else
    read -p "请输入staging目录: " ipfs_staging
    read -p "请输入data目录: " ipfs_data
fi

# 创建目录
mkdir -p $ipfs_staging
mkdir -p $ipfs_data
echo -e "${GREEN}目录已创建：${NC}"
echo "Staging目录: $ipfs_staging"
echo "Data目录: $ipfs_data"

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# 设置端口
echo -e "${YELLOW}配置端口...${NC}"
# 默认端口
DEFAULT_SWARM_PORT="17802"
DEFAULT_GATEWAY_PORT="17801"
DEFAULT_API_PORT="12801"

# 询问用户是否使用默认端口
read -p "是否使用默认端口? (Swarm: $DEFAULT_SWARM_PORT, Gateway: $DEFAULT_GATEWAY_PORT, API: $DEFAULT_API_PORT) [Y/n]: " use_default_ports
use_default_ports=${use_default_ports:-Y}

if [[ $use_default_ports =~ ^[Yy]$ ]]; then
    swarm_port=$DEFAULT_SWARM_PORT
    gateway_port=$DEFAULT_GATEWAY_PORT
    api_port=$DEFAULT_API_PORT
else
    read -p "请输入Swarm端口: " swarm_port
    read -p "请输入Gateway端口: " gateway_port
    read -p "请输入API端口: " api_port
fi

# 检查端口占用
for port in $swarm_port $gateway_port $api_port; do
    if check_port $port; then
        echo "警告: 端口 $port 已被占用，您可能需要选择其他端口。"
        read -p "是否继续? [y/N]: " continue_anyway
        continue_anyway=${continue_anyway:-N}
        if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
            echo "部署已取消。"
            exit 1
        fi
    fi
done

echo -e "${GREEN}端口配置完成√${NC}"

# 移除已存在的IPFS容器
echo -e "${YELLOW}检查并移除已存在的IPFS容器...${NC}"
if [ "$(docker ps -a | grep ipfs_host)" ]; then
    read -p "已存在名为ipfs_host的容器，是否移除? [Y/n]: " remove_container
    remove_container=${remove_container:-Y}
    if [[ $remove_container =~ ^[Yy]$ ]]; then
        docker stop ipfs_host >/dev/null 2>&1
        docker rm ipfs_host >/dev/null 2>&1
        echo -e "${GREEN}已移除旧容器√${NC}"
    else
        echo "部署已取消。"
        exit 1
    fi
fi

# 拉取最新的IPFS镜像
echo -e "${YELLOW}拉取最新的IPFS/Kubo镜像...${NC}"
docker pull ipfs/kubo:latest
echo -e "${GREEN}镜像拉取完成√${NC}"

# 运行IPFS容器
echo -e "${YELLOW}运行IPFS容器...${NC}"
docker run -d --name ipfs_host \
    -v $ipfs_staging:/export \
    -v $ipfs_data:/data/ipfs \
    -p $swarm_port:4001 \
    -p $swarm_port:4001/udp \
    -p 0.0.0.0:$gateway_port:8080 \
    -p 0.0.0.0:$api_port:5001 \
    ipfs/kubo:latest

# 检查容器是否成功运行
if [ $? -ne 0 ]; then
    echo "容器运行失败，请检查错误信息。"
    exit 1
fi
echo -e "${GREEN}容器已成功运行√${NC}"

# 等待IPFS节点启动
echo -e "${YELLOW}等待IPFS节点启动...${NC}"
sleep 5

# 配置CORS
echo -e "${YELLOW}配置CORS...${NC}"
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT","GET", "POST", "OPTIONS"]'
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
echo -e "${GREEN}CORS配置完成√${NC}"

# 询问是否配置高级选项
echo -e "${YELLOW}是否需要配置高级选项?${NC}"
read -p "断开所有swarm连接? [y/N]: " disconnect_swarm
disconnect_swarm=${disconnect_swarm:-N}
if [[ $disconnect_swarm =~ ^[Yy]$ ]]; then
    docker exec ipfs_host ipfs swarm disconnect --all
    echo "已断开所有swarm连接。"
fi

read -p "移除所有bootstrap节点? [y/N]: " remove_bootstrap
remove_bootstrap=${remove_bootstrap:-N}
if [[ $remove_bootstrap =~ ^[Yy]$ ]]; then
    docker exec ipfs_host ipfs bootstrap rm --all
    echo "已移除所有bootstrap节点。"
fi

read -p "设置存储上限(默认75GB)? [y/N]: " set_storage_max
set_storage_max=${set_storage_max:-N}
if [[ $set_storage_max =~ ^[Yy]$ ]]; then
    read -p "请输入存储上限(字节，默认75161927680): " storage_max
    storage_max=${storage_max:-75161927680}
    docker exec ipfs_host ipfs config --json Datastore.StorageMax "\"$storage_max\""
    echo "已设置存储上限为 $storage_max 字节。"
fi

# 重启IPFS容器
echo -e "${YELLOW}重启IPFS容器...${NC}"
docker restart ipfs_host
echo -e "${GREEN}IPFS容器已重启√${NC}"

# 显示IPFS节点信息
echo -e "${YELLOW}获取IPFS节点信息...${NC}"
node_id=$(docker exec ipfs_host ipfs id -f="<id>")
echo -e "${GREEN}IPFS节点已成功部署!${NC}"
echo -e "${GREEN}=========================${NC}"
echo "节点ID: $node_id"
echo "API地址: http://localhost:$api_port/api/v0"
echo "网关地址: http://localhost:$gateway_port/ipfs/"
echo "Swarm端口: $swarm_port"
echo -e "${GREEN}=========================${NC}"
echo "您可以使用以下命令查看日志:"
echo "  docker logs -f ipfs_host"
echo ""
echo "要停止IPFS节点，请运行:"
echo "  docker stop ipfs_host"
echo ""
echo "要重新启动IPFS节点，请运行:"
echo "  docker start ipfs_host"
