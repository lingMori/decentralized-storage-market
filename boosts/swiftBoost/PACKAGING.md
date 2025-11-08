# IPFS 安装器 - 打包说明

## 快速打包

### 1. 准备应用图标（可选）

如果您有图标图片（推荐 1024x1024 PNG 格式）：

```bash
chmod +x create_icon.sh
./create_icon.sh your-icon.png
```

这会在 `Resources/` 目录下生成 `AppIcon.icns` 文件。

### 2. 构建应用

```bash
chmod +x build_app.sh
./build_app.sh
```

这会创建 `IPFS安装器.app` 应用包。

### 3. 运行应用

```bash
open "IPFS安装器.app"
```

### 4. 创建 DMG 安装包（用于分发）

```bash
hdiutil create -volname "IPFS安装器" -srcfolder "IPFS安装器.app" -ov -format UDZO IPFS安装器.dmg
```

## 手动步骤

如果您想手动完成这些步骤：

1. **编译 Release 版本**
   ```bash
   swift build -c release
   ```

2. **创建 App Bundle**
   ```bash
   mkdir -p "IPFS安装器.app/Contents/MacOS"
   mkdir -p "IPFS安装器.app/Contents/Resources"
   ```

3. **复制文件**
   ```bash
   cp .build/release/swiftBoost "IPFS安装器.app/Contents/MacOS/IPFS安装器"
   cp Resources/Info.plist "IPFS安装器.app/Contents/"
   cp Resources/AppIcon.icns "IPFS安装器.app/Contents/Resources/" # 如果有图标
   ```

4. **设置权限**
   ```bash
   chmod +x "IPFS安装器.app/Contents/MacOS/IPFS安装器"
   ```

## 图标资源

如果您没有准备图标，可以：

1. 使用在线工具生成 IPFS 相关图标
2. 从 IPFS 官方网站下载 logo
3. 使用 SF Symbols 中的系统图标

推荐的图标主题：
- IPFS logo
- 服务器/存储相关图标
- Docker 容器图标

## 代码签名（可选）

如果需要分发给其他用户，建议进行代码签名：

```bash
codesign --force --deep --sign "Developer ID Application: Your Name" "IPFS安装器.app"
```

## 公证（可选）

对于 macOS 10.15+ 的分发：

```bash
# 1. 创建 zip 包
ditto -c -k --keepParent "IPFS安装器.app" "IPFS安装器.zip"

# 2. 上传公证
xcrun notarytool submit "IPFS安装器.zip" --keychain-profile "AC_PASSWORD" --wait

# 3. 附加公证票据
xcrun stapler staple "IPFS安装器.app"
```

## 故障排除

### 无法打开应用（"已损坏"提示）

```bash
xattr -cr "IPFS安装器.app"
```

### 权限问题

确保可执行文件有执行权限：
```bash
chmod +x "IPFS安装器.app/Contents/MacOS/IPFS安装器"
```
