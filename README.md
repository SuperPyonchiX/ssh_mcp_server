# SSH MCP Server (TypeScript)

SSH接続機能を提供するMCP（Model Context Protocol）サーバーのTypeScript実装です。Ubuntu仮想マシンをSSH経由で操作し、VS Code Copilotと連携してリモート開発環境での作業を効率化します。

## 📁 プロジェクト構造

```
ssh_mcp_server/
├── package.json            # プロジェクト設定とビルド設定
├── package-lock.json       # 依存関係ロックファイル
├── tsconfig.json           # TypeScript設定
├── build/                  # コンパイル済みJavaScriptファイル
│   ├── index.js
│   ├── index.js.map
│   ├── index.d.ts
│   └── index.d.ts.map
├── src/                    # TypeScriptソースコード
│   └── index.ts            # メインサーバー実装
├── test_tools_list.js      # ツールリストテスト
├── README.md               # このファイル
└── .gitignore              # Git除外設定
```

## 機能

- **SSH接続管理**: パスワード認証および秘密鍵認証に対応
- **リモートコマンド実行**: 作業ディレクトリ指定も可能
- **ファイル転送**: SFTP経由でのアップロード・ダウンロード
- **システム情報取得**: 接続先の詳細な情報を取得
- **環境変数サポート**: 接続情報の安全な管理
- **VS Code連携**: GitHub Copilotとの完全統合
- **詳細ログ出力**: デバッグに便利なログ機能

## 前提条件

- **Node.js**: 18.0.0 以上
- **npm**: Node.js付属のパッケージマネージャー
- **TypeScript**: 開発時に使用（devDependenciesに含む）

Node.jsのインストール:
```bash
# 最新LTS版のインストール
winget install OpenJS.NodeJS.LTS
```

## クイックスタート

### 1. 依存関係のセットアップ

```bash
npm install
```

このコマンドで以下が実行されます：
- 必要なNode.jsパッケージのインストール
- TypeScript関連の開発依存関係のセットアップ

### 2. プロジェクトのビルド

```bash
npm run build
```

TypeScriptファイルがJavaScriptにコンパイルされ、`build/`ディレクトリに出力されます。

### 3. SSH接続情報の設定

環境変数を設定してSSH接続情報を管理してください：

```bash
# Windows (コマンドプロンプト)
set UBUNTU_SSH_HOST=192.168.56.103
set UBUNTU_SSH_PORT=22
set UBUNTU_SSH_USERNAME=your_username
set UBUNTU_SSH_PASSWORD=your_password

# Windows (PowerShell)
$env:UBUNTU_SSH_HOST="192.168.56.103"
$env:UBUNTU_SSH_PORT="22"
$env:UBUNTU_SSH_USERNAME="your_username"
$env:UBUNTU_SSH_PASSWORD="your_password"

# Linux/macOS
export UBUNTU_SSH_HOST=192.168.56.103
export UBUNTU_SSH_PORT=22
export UBUNTU_SSH_USERNAME=your_username
export UBUNTU_SSH_PASSWORD=your_password
```

### 4. サーバーの起動

```bash
# ビルド済みファイルから実行（推奨）
npm start

# または直接実行
node build/index.js
```

## VS Code / Claude Desktop での設定

### VS Code MCP設定

VS CodeでCopilotと連携する場合、`mcp.json`ファイルに以下の設定を追加してください：

**ファイル場所**: 
- **Windows**: `%APPDATA%\Code - Insiders\User\mcp.json` (Insiders版) または `%APPDATA%\Code\User\mcp.json` (安定版)
- **macOS**: `~/Library/Application Support/Code - Insiders/User/mcp.json` または `~/Library/Application Support/Code/User/mcp.json`
- **Linux**: `~/.config/Code - Insiders/User/mcp.json` または `~/.config/Code/User/mcp.json`

```json
{
  "servers": {
    "ssh-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/ssh_mcp_server/build/index.js"],
      "env": {
        "UBUNTU_SSH_HOST": "192.168.56.103",
        "UBUNTU_SSH_PORT": "22", 
        "UBUNTU_SSH_USERNAME": "your_username",
        "UBUNTU_SSH_PASSWORD": "your_password"
      }
    }
  }
}
```

### Claude Desktop設定

Claude Desktopで使用する場合、設定ファイルに以下を追加：

**ファイル場所**:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ssh-server": {
      "command": "node",
      "args": ["path/to/ssh_mcp_server/build/index.js"],
      "env": {
        "UBUNTU_SSH_HOST": "192.168.56.103",
        "UBUNTU_SSH_PORT": "22",
        "UBUNTU_SSH_USERNAME": "your_username",
        "UBUNTU_SSH_PASSWORD": "your_password"
      }
    }
  }
}
```

### 環境変数による設定 (推奨)

セキュリティを考慮し、システムの環境変数で設定することも可能です：

```json
{
  "servers": {
    "ssh-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/ssh_mcp_server/build/index.js"]
    }
  }
}
```

**秘密鍵認証を使用する場合:**

```bash
# パスワードの代わりに秘密鍵を使用
export UBUNTU_SSH_PRIVATE_KEY_PATH="/path/to/your/private/key"
export UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE="your_passphrase_if_needed"
```

### 設定のポイント

1. **パス設定**: `args`のパスは、あなたの環境に合わせて変更してください
2. **環境変数**: SSH接続情報は設定ファイル内または環境変数で指定
3. **セキュリティ**: パスワードは設定ファイル内ではなく、環境変数を推奨

### VS Codeでの使用

1. VS Code（GitHub Copilot有効）を起動
2. Copilotチャットで以下のようにリクエスト：
   - "Ubuntuに接続してシステム情報を取得してください"
   - "docker コマンドを実行してください"
   - "ファイルをアップロードしてビルドを実行してください"

MCPサーバーが自動的に呼び出され、Ubuntu VM上での操作が実行されます。

## 利用可能なMCPツール

| ツール名 | 説明 | 主要パラメータ |
|---------|------|----------------|
| **connect_ssh** | SSH接続を確立 | host, username, password/private_key |
| **execute_command** | リモートコマンド実行 | command, cwd（作業ディレクトリ） |
| **upload_file** | ファイルアップロード | local_path, remote_path |
| **download_file** | ファイルダウンロード | remote_path, local_path |
| **disconnect_ssh** | SSH接続切断 | なし |
| **get_system_info** | システム情報取得 | なし |

### ツールの詳細

#### connect_ssh
Ubuntu VMにSSH接続を確立します。パラメータを省略した場合は環境変数から自動取得します。

**パラメータ:**
- `host` (オプション): SSH接続先ホスト（環境変数: `UBUNTU_SSH_HOST`）
- `username` (オプション): SSHユーザー名（環境変数: `UBUNTU_SSH_USERNAME`）
- `port` (オプション): SSHポート（環境変数: `UBUNTU_SSH_PORT`、デフォルト: 22）
- `password` (オプション): パスワード（環境変数: `UBUNTU_SSH_PASSWORD`）
- `private_key` (オプション): 秘密鍵の内容（環境変数: `UBUNTU_SSH_PRIVATE_KEY_PATH`）
- `private_key_passphrase` (オプション): 秘密鍵パスフレーズ（環境変数: `UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE`）

#### execute_command
接続されたUbuntu VMでコマンドを実行し、結果を取得します。標準出力・標準エラー・終了コードをすべて取得できます。

**パラメータ:**
- `command` (必須): 実行するシェルコマンド
- `cwd` (オプション): コマンドを実行する作業ディレクトリ

**使用例:**
- システム情報取得: `uname -a`
- Dockerコンテナ実行: `docker run --rm ubuntu echo "Hello World"`
- ファイル操作: `ls -la /home/user`

#### upload_file
ローカルファイルをUbuntu VMにアップロードします。ディレクトリが存在しない場合は自動作成されます。

**パラメータ:**
- `local_path` (必須): ローカルのファイルパス
- `remote_path` (必須): アップロード先のVMファイルパス

#### download_file  
Ubuntu VMからローカルにファイルをダウンロードします。ローカルのディレクトリが存在しない場合は自動作成されます。

**パラメータ:**
- `remote_path` (必須): ダウンロード元のVMファイルパス
- `local_path` (必須): 保存先のローカルファイルパス

#### get_system_info
Ubuntu VMの詳細なシステム情報を一括取得します。

**取得情報:**
- システム情報 (uname)
- OS リリース情報
- ディスク使用量
- メモリ使用量  
- CPU情報
- ネットワークインターフェース
- 実行中プロセス一覧
- システムアップタイム

#### disconnect_ssh
SSH接続を切断し、リソースを解放します。作業完了後は必ず実行することを推奨します。

## 使用方法

このサーバーはModel Context Protocolを使用して通信します。MCPクライアント（例：Claude Desktop、VS Code拡張など）から上記のツールを呼び出すことができます。

### 基本的な使用フロー

1. `connect_ssh` でSSH接続を確立
2. `execute_command` でリモートコマンドを実行
3. 必要に応じて `upload_file` / `download_file` でファイル転送
4. `get_system_info` でシステム情報を取得
5. 作業完了後、`disconnect_ssh` で接続を切断

### 使用例：Dockerビルド実行

```
1. connect_ssh() でSSH接続
2. execute_command("docker run --rm -v /home/kosuke/work/TCPTestApp:/workspace -w /workspace ubuntu-dev bash -c '/workspace/Build.sh'")
3. disconnect_ssh() で切断
```

### 使用例：ファイル転送とスクリプト実行

```
1. connect_ssh() でSSH接続
2. upload_file("local_script.sh", "/tmp/script.sh")
3. execute_command("chmod +x /tmp/script.sh && /tmp/script.sh", cwd="/tmp")
4. download_file("/tmp/output.txt", "result.txt")
5. disconnect_ssh() で切断
```

### 実際のCopilot使用例

以下のようなリクエストでMCPサーバーが自動的に呼び出されます：

- **システム情報確認**: "Ubuntuに接続してシステム情報を取得してください"
- **Docker実行**: "Ubuntuで以下のコマンドを実行してください: docker run --rm ubuntu echo 'Hello World'"
- **ファイル管理**: "ローカルのconfig.jsonをVMの/home/user/にアップロードしてください"
- **リモート開発**: "VMに接続してプロジェクトをビルドし、結果をダウンロードしてください"

## 開発・デバッグ

### 開発モードでの実行
```bash
# TypeScriptファイルを監視して自動コンパイル
npm run dev

# または手動でのビルドと実行
npm run build
npm start
```

### 手動でのMCPサーバーテスト
```bash
# サーバーを直接起動
npm start

# または
node build/index.js

# ツールリストの確認
node test_tools_list.js
```

### 設定検証

現在の設定や接続が正常に動作するかテストできます：

```bash
# ツールリストの動作確認
node test_tools_list.js
```

### ログ出力の確認

**VS Code Copilotでの実行時**:
MCPサーバーのログはVS Codeの出力パネルで確認できます：
1. VS Codeで `表示` → `出力` を開く
2. ドロップダウンから該当するMCPサーバーを選択

**コマンドラインでの実行時**:
標準出力に詳細なログが表示されます。

## トラブルシューティング

### 一般的な問題

1. **接続エラー**: 環境変数の設定を確認
2. **認証エラー**: パスワードまたは秘密鍵の設定を確認
3. **ビルドエラー**: `npm run build` を再実行
4. **コマンドが見つからない**: `node build/index.js` でパスを確認

### SSH接続の問題

**SSH接続エラー**
- Ubuntu VMでSSHサーバーが起動しているか確認: `sudo systemctl status ssh`
- ファイアウォール設定の確認: `sudo ufw status`
- VMのネットワーク設定（ポートフォワーディングなど）の確認

**認証エラー**
- 環境変数の値を再確認
- パスワード認証が有効になっているか確認: `/etc/ssh/sshd_config`
- 秘密鍵のパーミッション確認: `chmod 600 ~/.ssh/id_rsa`

### VS Code連携の問題

**MCP設定エラー**
- mcp.jsonファイルの場所とJSON構文を確認
- GitHub Copilotが有効になっているか確認
- VS Code を再起動して設定を反映

**パス関連エラー**
- mcp.jsonの`args`パスが正しいか確認
- 相対パスではなく絶対パスを使用することを推奨

### デバッグモード

より詳細なログが必要な場合は、`src/index.ts`内のログレベルを変更してください：

```typescript
// デバッグレベルのログを有効化
console.log("詳細なデバッグ情報...");
```

### ログ確認方法

1. VS Codeの出力パネルでMCPサーバーのログを確認
2. コマンドラインでサーバーを直接実行してデバッグ情報を取得
3. SSH接続の詳細ログが必要な場合は、サーバーコードでログレベルを調整

## セキュリティに関する注意

- SSH接続の認証情報は安全に管理してください
- 環境変数でパスワードを管理することを推奨します
- SSH接続は信頼できるネットワークでのみ使用してください
- 秘密鍵ファイルの権限設定に注意してください（通常は600）
- 本番環境では、環境変数での認証情報管理を推奨します

## システム要件

### ローカル環境
- **Node.js**: 18.0.0 以上
- **npm**: Node.js付属のパッケージマネージャー
- **VS Code**: GitHub Copilot拡張機能が有効
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)

### Ubuntu VM環境  
- **OS**: Ubuntu 18.04 LTS 以上
- **SSH**: OpenSSH Server (`sudo apt install openssh-server`)
- **ネットワーク**: SSH接続可能な設定（ポート22またはカスタムポート）
- **Docker**: 必要に応じて (`sudo apt install docker.io`)

## 技術仕様

- **プログラミング言語**: TypeScript 5.x
- **ランタイム**: Node.js 18.0.0+
- **MCPフレームワーク**: @modelcontextprotocol/sdk
- **SSH/SFTPライブラリ**: ssh2
- **ビルドツール**: TypeScript Compiler (tsc)
- **パッケージマネージャー**: npm

### 依存関係

**本体依存関係:**
- `@modelcontextprotocol/sdk` - MCP（Model Context Protocol）サーバーSDK
- `ssh2` - SSH/SFTPクライアント
- `zod` - スキーマ検証

**開発依存関係:**
- `typescript` - TypeScript コンパイラ
- `@types/node` - Node.js型定義

## 開発者向け情報

### プロジェクト構造の特徴
- **TypeScript**: 型安全性とIDE支援の充実
- **MCP SDK**: Model Context Protocolの標準実装
- **シンプル構成**: 最小限の依存関係で高い機能性を実現

### カスタマイズ

プロジェクトをカスタマイズする場合は以下のファイルを編集してください：

- `src/index.ts`: メインのサーバーロジック
- `package.json`: プロジェクト設定と依存関係
- `tsconfig.json`: TypeScript コンパイル設定

## ライセンス

MIT License

## 貢献

Issue報告やPull Requestを歓迎します。機能追加や改善提案がある場合は、GitHubのIssueで相談してください。

### 開発への参加

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成
