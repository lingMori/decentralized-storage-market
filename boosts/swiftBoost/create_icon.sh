#!/bin/bash
# 创建 macOS 应用图标
# 使用方法: ./create_icon.sh input.png
# input.png 应该是至少 1024x1024 的正方形图片

if [ $# -eq 0 ]; then
    echo "用法: ./create_icon.sh <图片文件>"
    echo "图片应该是至少 1024x1024 的正方形 PNG 文件"
    exit 1
fi

INPUT_IMAGE="$1"

if [ ! -f "$INPUT_IMAGE" ]; then
    echo "错误: 文件不存在: $INPUT_IMAGE"
    exit 1
fi

# 创建临时目录
ICONSET_DIR="AppIcon.iconset"
mkdir -p "$ICONSET_DIR"

echo "🎨 生成各种尺寸的图标..."

# 生成所需的各种尺寸
sips -z 16 16     "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_16x16.png" > /dev/null 2>&1
sips -z 32 32     "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_16x16@2x.png" > /dev/null 2>&1
sips -z 32 32     "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_32x32.png" > /dev/null 2>&1
sips -z 64 64     "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_32x32@2x.png" > /dev/null 2>&1
sips -z 128 128   "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_128x128.png" > /dev/null 2>&1
sips -z 256 256   "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_128x128@2x.png" > /dev/null 2>&1
sips -z 256 256   "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_256x256.png" > /dev/null 2>&1
sips -z 512 512   "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_256x256@2x.png" > /dev/null 2>&1
sips -z 512 512   "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_512x512.png" > /dev/null 2>&1
sips -z 1024 1024 "$INPUT_IMAGE" --out "${ICONSET_DIR}/icon_512x512@2x.png" > /dev/null 2>&1

echo "📦 转换为 .icns 格式..."
iconutil -c icns "$ICONSET_DIR" -o "Resources/AppIcon.icns"

# 清理临时文件
rm -rf "$ICONSET_DIR"

echo "✅ 图标创建完成: Resources/AppIcon.icns"
