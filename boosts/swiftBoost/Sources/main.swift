// IPFS Installer (SwiftUI, macOS)
// A self-contained SwiftUI app that provides a GUI to install, configure,
// start, stop, restart, and monitor an IPFS node running in Docker (ipfs/kubo).
//
// 
// Features
// - Checks Docker availability
// - Lets user pick staging & data directories (with sensible defaults)
// - Configures ports (Swarm/Gateway/API) with validation
// - One-click Install/Init: docker pull + docker run + CORS + optional tweaks
// - Start/Stop/Restart container controls
// - Optional: disconnect swarm, remove bootstrap nodes, set storage limit
// - Shows live logs (docker logs -f ipfs_host)
// - Displays Node ID & handy links (Gateway/API)
// - Persists settings using UserDefaults
//
// Notes
// - This app reproduces the common steps from a typical IPFS Docker script so the GUI works
//   even if your original bash script is interactive. If you prefer, you can still wire this
//   UI to call your script by replacing `docker(...)` invocations with a call to the script.
// - Assumes Docker Desktop for Mac is installed and `docker` is on PATH.
//
// Build
// - Xcode > New > Project > macOS App (SwiftUI)
// - Replace ContentView/App files with this single file, or add this as a new file and set @main below
//
import SwiftUI
import Combine
import AppKit

// MARK: - Constants
struct Defaults {
    static let stagingPath = (NSHomeDirectory() as NSString).appendingPathComponent("ipfs/staging")
    static let dataPath    = (NSHomeDirectory() as NSString).appendingPathComponent("ipfs/data")
    static let swarmPort   = "17802"
    static let gatewayPort = "17801"
    static let apiPort     = "12801"
    static let storageMaxGB = 75 // shown to user; converted to bytes for Kubo
    static let containerName = "ipfs_host"
    static let image = "ipfs/kubo:latest"
}

// MARK: - Model
struct IPFSConfig: Codable, Equatable {
    var stagingPath: String = Defaults.stagingPath
    var dataPath: String = Defaults.dataPath
    var swarmPort: String = Defaults.swarmPort
    var gatewayPort: String = Defaults.gatewayPort
    var apiPort: String = Defaults.apiPort

    var disconnectSwarm: Bool = false
    var removeBootstrap: Bool = false
    var setStorageMax: Bool = true
    var storageMaxGB: Int = Defaults.storageMaxGB

    var runWithSudo: Bool = false // usually not needed for docker on macOS
}

// MARK: - Utility: Folder Picker
final class FolderPicker {
    @MainActor
    static func chooseFolder(startingAt: URL? = nil) -> URL? {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        panel.canCreateDirectories = true
        if let startingAt { panel.directoryURL = startingAt }
        return panel.runModal() == .OK ? panel.url : nil
    }
}

// MARK: - Shell Runner
@available(macOS 10.15, *)
@MainActor
final class Shell: ObservableObject {
    @Published var isRunning = false
    @Published var lastExitCode: Int32 = 0

    private var process: Process?
    private var outPipe = Pipe()
    private var errPipe = Pipe()

    func runStreaming(_ command: String,
                      env: [String:String] = [:],
                      withPrivileges: Bool = false,
                      append: @escaping (String) -> Void,
                      termination: @escaping (Int32) -> Void) {
        // We always launch a login shell to make PATH consistent with user's shell.
        // Using bash -lc so we can pass a single command string.
        let fullCommand = withPrivileges
            ? "osascript -e 'do shell script \"\(commandEscapedForAppleScript(command))\" with administrator privileges'"
            : command

        let proc = Process()
        proc.launchPath = "/bin/bash"
        proc.arguments = ["-lc", fullCommand]
        var envCombined = ProcessInfo.processInfo.environment
        envCombined.merge(env) { _, new in new }
        proc.environment = envCombined

        outPipe = Pipe(); errPipe = Pipe()
        proc.standardOutput = outPipe
        proc.standardError = errPipe

        let outHandle = outPipe.fileHandleForReading
        let errHandle = errPipe.fileHandleForReading

        func readHandle(_ h: FileHandle) {
            h.readabilityHandler = { [append] handle in
                let data = handle.availableData
                if data.count > 0, let str = String(data: data, encoding: .utf8), !str.isEmpty {
                    DispatchQueue.main.async { append(str) }
                }
            }
        }

        readHandle(outHandle)
        readHandle(errHandle)

        isRunning = true
        process = proc
        proc.terminationHandler = { [weak self, termination] p in
            DispatchQueue.main.async {
                self?.isRunning = false
                self?.lastExitCode = p.terminationStatus
                self?.outPipe.fileHandleForReading.readabilityHandler = nil
                self?.errPipe.fileHandleForReading.readabilityHandler = nil
                termination(p.terminationStatus)
            }
        }

        do { try proc.run() } catch {
            append("\n[Shell] Failed to run: \(error.localizedDescription)\n")
            isRunning = false
            termination(-1)
        }
    }

    func stop() {
        process?.terminate()
        isRunning = false
    }

    private func commandEscapedForAppleScript(_ cmd: String) -> String {
        // Escape backslashes and quotes for AppleScript do shell script
        cmd
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
            .replacingOccurrences(of: "'", with: "'\\''")
    }
}

// MARK: - Docker Facade
@available(macOS 10.15, *)
@MainActor
final class Docker: ObservableObject {
    @Published var dockerOK: Bool = false
    @Published var containerStatus: String = "Unknown"
    @Published var nodeID: String = ""

    private let shell = Shell()

    func checkDocker(append: @escaping (String)->Void, completion: @escaping (Bool)->Void) {
        shell.runStreaming("docker version --format '{{.Server.Version}}'", append: append) { code in
            let ok = (code == 0)
            self.dockerOK = ok
            if ok == false {
                append("Docker 不可用。请先安装并启动 Docker Desktop。\n")
            }
            completion(ok)
        }
    }

    func refreshContainerStatus(append: @escaping (String)->Void = {_ in}) {
        shell.runStreaming("docker ps -a --filter name=^/\(Defaults.containerName)$ --format '{{.Status}}'", append: append) { _ in }
        // The user-facing summary will be updated by the log, but we also parse it roughly:
        shell.runStreaming("docker ps -a --filter name=^/\(Defaults.containerName)$ --format '{{.Status}}' | head -n1", append: { s in
            DispatchQueue.main.async { self.containerStatus = s.trimmingCharacters(in: .whitespacesAndNewlines) }
        }) { _ in }
    }

    func containerExists(_ completion: @escaping (Bool)->Void) {
        shell.runStreaming("docker ps -a --filter name=^/\(Defaults.containerName)$ --format '{{.Names}}'", append: { _ in }) { _ in
            // The termination will have appended lines; instead, query again synchronously via which we cannot here.
        }
        // Quick one-shot check
        let task = Process()
        task.launchPath = "/bin/bash"
        task.arguments = ["-lc", "docker ps -a --filter name=^/\(Defaults.containerName)$ --format '{{.Names}}' | grep -q '^\(Defaults.containerName)$'"]
        do { try task.run(); task.waitUntilExit(); completion(task.terminationStatus == 0) }
        catch { completion(false) }
    }

    func installAndInit(config: IPFSConfig, append: @escaping (String)->Void, done: @escaping (Bool)->Void) {
        let staging = escapePath(config.stagingPath)
        let data = escapePath(config.dataPath)
        let swarm = config.swarmPort
        let gateway = config.gatewayPort
        let api = config.apiPort

        // Ensure directories exist
        try? FileManager.default.createDirectory(atPath: config.stagingPath, withIntermediateDirectories: true)
        try? FileManager.default.createDirectory(atPath: config.dataPath, withIntermediateDirectories: true)

        let base = [
            "echo '[步骤 1/6] 拉取镜像'",
            "docker pull \(Defaults.image)",
            "echo '[步骤 2/6] 清理已有容器（若有）'",
            "(docker ps -a --format '{{.Names}}' | grep -q '^\(Defaults.containerName)$') && (docker stop \(Defaults.containerName) || true; docker rm \(Defaults.containerName) || true) || true",
            "echo '[步骤 3/6] 运行容器'",
            "docker run -d --name \(Defaults.containerName) \\",
            "  -v \(staging):/export \\",
            "  -v \(data):/data/ipfs \\",
            "  -p \(swarm):4001 \\",
            "  -p \(swarm):4001/udp \\",
            "  -p 0.0.0.0:\(gateway):8080 \\",
            "  -p 0.0.0.0:\(api):5001 \\",
            "  \(Defaults.image)",
            "echo '[步骤 4/6] 设置 CORS'",
            "docker exec \(Defaults.containerName) ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\",\"GET\",\"POST\",\"OPTIONS\"]'",
            "docker exec \(Defaults.containerName) ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[\"*\"]'",
            "docker exec \(Defaults.containerName) ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '[\"true\"]'",
            "docker exec \(Defaults.containerName) ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '[\"Authorization\"]'",
            "docker exec \(Defaults.containerName) ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '[\"Location\"]'",
        ]

        var optional: [String] = []
        if config.disconnectSwarm {
            optional.append("echo '[可选] 断开所有 swarm 连接'")
            optional.append("docker exec \(Defaults.containerName) ipfs swarm disconnect --all || true")
        }
        if config.removeBootstrap {
            optional.append("echo '[可选] 移除所有 bootstrap 节点'")
            optional.append("docker exec \(Defaults.containerName) ipfs bootstrap rm --all || true")
        }
        if config.setStorageMax {
            // Convert GB to bytes (GiB-approx using 1024^3)
            let bytes = Int64(config.storageMaxGB) * 1_073_741_824
            optional.append("echo '[可选] 设置存储上限：\(config.storageMaxGB) GB (~\(bytes) bytes)'")
            optional.append("docker exec \(Defaults.containerName) ipfs config --json Datastore.StorageMax \"\"\"\(bytes)\"\"\"")
        }

        let finish = [
            "echo '[步骤 5/6] 重启容器'",
            "docker restart \(Defaults.containerName)",
            "echo '[步骤 6/6] 读取节点 ID'",
            "docker exec \(Defaults.containerName) ipfs id -f=\"<id>\"",
        ]

        let command = (base + optional + finish).joined(separator: "; ")
        shell.runStreaming(command, withPrivileges: config.runWithSudo, append: append) { code in
            DispatchQueue.main.async {
                self.refreshContainerStatus(append: append)
                // try to pick line containing a CID-like ID from the tail
                done(code == 0)
            }
        }
    }

    func start(append: @escaping (String)->Void) {
        shell.runStreaming("docker start \(Defaults.containerName)", append: append) { _ in
            self.refreshContainerStatus(append: append)
        }
    }

    func stop(append: @escaping (String)->Void) {
        shell.runStreaming("docker stop \(Defaults.containerName)", append: append) { _ in
            self.refreshContainerStatus(append: append)
        }
    }

    func restart(append: @escaping (String)->Void) {
        shell.runStreaming("docker restart \(Defaults.containerName)", append: append) { _ in
            self.refreshContainerStatus(append: append)
        }
    }

    func remove(append: @escaping (String)->Void) {
        shell.runStreaming("(docker stop \(Defaults.containerName) || true); (docker rm \(Defaults.containerName) || true)", append: append) { _ in
            self.refreshContainerStatus(append: append)
        }
    }

    func readNodeID(append: @escaping (String)->Void, completion: @escaping (String)->Void) {
        shell.runStreaming("docker exec \(Defaults.containerName) ipfs id -f=\"<id>\"", append: append) { _ in }
        let task = Process()
        task.launchPath = "/bin/bash"
        task.arguments = ["-lc", "docker exec \(Defaults.containerName) ipfs id -f=\"<id>\" 2>/dev/null | tr -d '\n' "]
        let pipe = Pipe(); task.standardOutput = pipe
        do {
            try task.run(); task.waitUntilExit()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let id = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            DispatchQueue.main.async { self.nodeID = id; completion(id) }
        } catch {
            DispatchQueue.main.async { completion("") }
        }
    }

    func tailLogs(append: @escaping (String)->Void) -> Shell { // returns shell to stop later
        let sh = Shell()
        sh.runStreaming("docker logs -f \(Defaults.containerName)", append: append) { _ in }
        return sh
    }

    private func escapePath(_ path: String) -> String { path.replacingOccurrences(of: " ", with: "\\ ") }
}

// MARK: - ViewModel
@available(macOS 12, *)
@MainActor
final class ViewModel: ObservableObject {
    @Published var cfg: IPFSConfig
    @Published var log: AttributedString = "" // rich log with autoscroll in view
    @Published var isBusy: Bool = false
    @Published var showLogs: Bool = true

    @Published var gatewayURL: URL? = nil
    @Published var apiURL: URL? = nil

    let docker = Docker()
    private var tailShell: Shell? = nil

    init() {
        self.cfg = Self.load()
    }

    // Persistence
    static func load() -> IPFSConfig {
        if let data = UserDefaults.standard.data(forKey: "ipfs.cfg"),
           let cfg = try? JSONDecoder().decode(IPFSConfig.self, from: data) {
            return cfg
        }
        return IPFSConfig()
    }

    func save() {
        if let data = try? JSONEncoder().encode(cfg) {
            UserDefaults.standard.set(data, forKey: "ipfs.cfg")
        }
    }

    func append(_ text: String) {
        var a = AttributedString(text)
        a.font = .system(.body, design: .monospaced)
        a.foregroundColor = .primary
        DispatchQueue.main.async { self.log += a }
    }

    func clearLog() { self.log = "" }

    func validatePorts() -> String? {
        for (name, s) in [("Swarm", cfg.swarmPort), ("Gateway", cfg.gatewayPort), ("API", cfg.apiPort)] {
            if Int(s) == nil { return "端口 \(name) 必须是数字。" }
        }
        return nil
    }

    func computeURLs() {
        gatewayURL = URL(string: "http://localhost:\(cfg.gatewayPort)/ipfs/")
        apiURL = URL(string: "http://localhost:\(cfg.apiPort)/api/v0")
    }

    func actionCheckDocker() {
        clearLog(); append("检查 Docker ...\n")
        docker.checkDocker(append: append) { ok in
            self.append(ok ? "Docker 正常。\n" : "Docker 不可用。\n")
            self.docker.refreshContainerStatus(append: self.append)
        }
    }

    func actionInstall() {
        if let err = validatePorts() { append("❌ \(err)\n"); return }
        computeURLs()
        clearLog(); isBusy = true
        append("开始安装 / 初始化 IPFS (Docker) ...\n\n")

        docker.installAndInit(config: cfg, append: append) { ok in
            self.append("\n完成：\(ok ? "成功" : "失败")。\n")
            self.isBusy = false
            self.docker.readNodeID(append: self.append) { id in
                if !id.isEmpty { self.append("节点 ID: \(id)\n") }
                self.append("API: \(self.apiURL?.absoluteString ?? "-")\n")
                self.append("Gateway: \(self.gatewayURL?.absoluteString ?? "-")\n")
            }
        }
    }

    func actionStart() { clearLog(); docker.start(append: append) }
    func actionStop()  { clearLog(); docker.stop(append: append) }
    func actionRestart() { clearLog(); docker.restart(append: append) }
    func actionRemove() { clearLog(); docker.remove(append: append) }

    func actionTailLogs() {
        showLogs = true
        clearLog()
        tailShell = docker.tailLogs(append: append)
    }

    func stopTailing() { tailShell?.stop(); tailShell = nil }
}

// MARK: - Views
@available(macOS 13, *)
struct ContentView: View {
    @StateObject var vm = ViewModel()
    @State private var autoScroll = true

    var body: some View {
        NavigationSplitView {
            settingsPanel
                .navigationTitle("IPFS 安装器")
        } detail: {
            logPanel
        }
        .frame(minWidth: 980, minHeight: 640)
        .onAppear {
            vm.computeURLs()
            vm.docker.refreshContainerStatus()
        }
    }

    private var settingsPanel: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                GroupBox("基本配置") {
                    VStack(alignment: .leading, spacing: 8) {
                        folderPicker(title: "Staging 目录", path: $vm.cfg.stagingPath)
                        folderPicker(title: "Data 目录", path: $vm.cfg.dataPath)

                        HStack(spacing: 12) {
                            portField("Swarm 端口", text: $vm.cfg.swarmPort)
                            portField("Gateway 端口", text: $vm.cfg.gatewayPort)
                            portField("API 端口", text: $vm.cfg.apiPort)
                        }
                    }
                }

                GroupBox("可选设置") {
                    Toggle("断开所有 Swarm 连接（初始化后）", isOn: $vm.cfg.disconnectSwarm)
                    Toggle("移除所有 Bootstrap 节点（初始化后）", isOn: $vm.cfg.removeBootstrap)
                    Toggle("设置仓库存储上限", isOn: $vm.cfg.setStorageMax)
                    HStack {
                        Stepper("上限：\(vm.cfg.storageMaxGB) GB", value: $vm.cfg.storageMaxGB, in: 1...2048)
                        Spacer()
                    }.disabled(!vm.cfg.setStorageMax)

                    Toggle("使用管理员权限运行（一般不需要）", isOn: $vm.cfg.runWithSudo)
                }

                GroupBox("动作") {
                    HStack(spacing: 12) {
                        Button("检查 Docker", action: vm.actionCheckDocker)
                        Button("安装 / 初始化", action: vm.actionInstall)
                            .buttonStyle(.borderedProminent)
                            .disabled(vm.isBusy)
                        Button("启动", action: vm.actionStart)
                        Button("停止", action: vm.actionStop)
                        Button("重启", action: vm.actionRestart)
                        Button(role: .destructive, action: vm.actionRemove) { Text("移除容器") }
                    }
                }

                GroupBox("容器状态") {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text("状态：")
                            Text(vm.docker.containerStatus.isEmpty ? "未知" : vm.docker.containerStatus)
                                .foregroundStyle(.secondary)
                        }
                        HStack {
                            Text("节点 ID：")
                            Text(vm.docker.nodeID.isEmpty ? "未读取" : vm.docker.nodeID)
                                .fontDesign(.monospaced)
                                .textSelection(.enabled)
                        }
                        HStack(spacing: 10) {
                            if let g = vm.gatewayURL { Link("打开 Gateway", destination: g) }
                            if let a = vm.apiURL { Link("打开 API", destination: a) }
                            Button("读取 Node ID") { vm.docker.readNodeID(append: vm.append) { _ in } }
                        }
                    }
                }

                GroupBox("日志") {
                    HStack(spacing: 12) {
                        Button(vm.showLogs ? "刷新日志" : "显示日志") { vm.showLogs = true; vm.actionTailLogs() }
                        Button("停止跟随") { vm.stopTailing() }
                        Spacer()
                        Toggle("自动滚动", isOn: $autoScroll).toggleStyle(.switch)
                    }
                }

                Spacer(minLength: 12)
            }
            .padding(16)
            .onChange(of: vm.cfg) { _ in vm.save(); vm.computeURLs() }
        }
    }

    private var logPanel: some View {
        VStack(alignment: .leading, spacing: 8) {
            if vm.showLogs {
                LogView(text: $vm.log, autoScroll: $autoScroll)
                    .background(Color(NSColor.textBackgroundColor))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .padding(16)
            } else {
                VStack {
                    Image(systemName: "doc.richtext")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("未显示日志")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            Spacer()
        }
        .toolbar(content: logToolbar)
    }
    
    @ToolbarContentBuilder
    private func logToolbar() -> some ToolbarContent {
        ToolbarItem {
            Button("跟随日志", action: vm.actionTailLogs)
        }
        ToolbarItem {
            Button("清空", action: vm.clearLog)
        }
    }

    private func folderPicker(title: String, path: Binding<String>) -> some View {
        HStack(spacing: 8) {
            Text(title)
                .frame(width: 100, alignment: .trailing)
            TextField("/path/to/folder", text: path)
                .textFieldStyle(.roundedBorder)
                .fontDesign(.monospaced)
            Button("选择…") {
                let initial = URL(fileURLWithPath: path.wrappedValue, isDirectory: true)
                if let url = FolderPicker.chooseFolder(startingAt: initial) {
                    path.wrappedValue = url.path
                }
            }
        }
    }

    private func portField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading) {
            Text(label)
            TextField("port", text: Binding(
                get: { text.wrappedValue },
                set: { new in text.wrappedValue = new.filter { $0.isNumber } }
            ))
            .frame(width: 120)
            .textFieldStyle(.roundedBorder)
            .fontDesign(.monospaced)
        }
    }
}

@available(macOS 13, *)
struct LogView: View {
    @Binding var text: AttributedString
    @Binding var autoScroll: Bool

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                Text(text)
                    .fontDesign(.monospaced)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .id("bottom")
            }
            .onChange(of: text) { _ in
                if autoScroll {
                    withAnimation(.linear(duration: 0.2)) { proxy.scrollTo("bottom", anchor: .bottom) }
                }
            }
        }
    }
}

// MARK: - App Entry
@available(macOS 13, *)
@main
struct IPFSInstallerApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .windowResizability(.contentSize)
    }
}
