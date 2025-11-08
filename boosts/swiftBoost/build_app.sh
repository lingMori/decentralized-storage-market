#!/bin/bash
# 打包 IPFS 安装器为 macOS 应用

set -e

echo "🔨 开始构建 IPFS 安装器..."

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 清理旧的构建
echo "🧹 清理旧构建..."
rm -rf .build/release
rm -rf IPFSInstaller.app

# 构建 Release 版本
echo "⚙️  编译 Release 版本..."
swift build -c release

# 创建 App Bundle 结构
echo "📦 创建应用包..."
APP_NAME="IPFS安装器"
APP_BUNDLE="${APP_NAME}.app"
CONTENTS="${APP_BUNDLE}/Contents"
MACOS="${CONTENTS}/MacOS"
RESOURCES="${CONTENTS}/Resources"

mkdir -p "${MACOS}"
mkdir -p "${RESOURCES}"

# 复制可执行文件
echo "📋 复制可执行文件..."
cp .build/release/swiftBoost "${MACOS}/${APP_NAME}"

# 复制并处理 Info.plist
echo "📋 复制配置文件..."
sed "s/\$(EXECUTABLE_NAME)/${APP_NAME}/g" Resources/Info.plist > "${CONTENTS}/Info.plist"

# 创建应用图标（如果存在）
if [ -f "Resources/AppIcon.icns" ]; then
    echo "🎨 复制应用图标..."
    cp Resources/AppIcon.icns "${RESOURCES}/"
else
    echo "⚠️  未找到 AppIcon.icns，将使用默认图标"
    echo "   提示：您可以创建 Resources/AppIcon.icns 来添加自定义图标"
fi

# 设置可执行权限
chmod +x "${MACOS}/${APP_NAME}"

echo "✅ 构建完成！"
echo "📍 应用位置: $(pwd)/${APP_BUNDLE}"
echo ""
echo "🚀 运行应用:"
echo "   open \"${APP_BUNDLE}\""
echo ""
echo "📦 如需分发，可以创建 DMG:"
echo "   hdiutil create -volname \"IPFS安装器\" -srcfolder \"${APP_BUNDLE}\" -ov -format UDZO IPFS安装器.dmg"
