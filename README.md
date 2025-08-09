# SSH MCP Server

Ubuntu仮想マシンをSSH経由で操作するためのMCP (Model Context Protocol) サーバーです。VS Code Copilotと連携して、AIエージェントがUbuntu VMに接続してコマンドを実行したり、ファイルの転送を行うことができます。

## 機能

- **SSH接続管理**: Ubuntu VMへのSSH接続（パスワード認証または秘密鍵認証対応）
- **セキュアな接続**: 環境変数による接続情報の安全な管理
- **リモートコマンド実行**: VM上でのコマンド実行とリアルタイム出力取得
- **ファイル転送**: 双方向のファイルアップロード・ダウンロード
- **システム監視**: VM のリソース情報やシステム状態の取得
- **VS Code連携**: GitHub Copilotとの完全統合

## インストールとセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. プロジェクトのビルド

```bash
npm run build
```

### 3. VS Code Copilotとの連携設定

本サーバーは主にVS CodeのGitHub Copilotと連携して使用することを想定しています。

**mcp.jsonファイルの場所:**
- **Windows**: `%APPDATA%\Code - Insiders\User\mcp.json` (Insiders版) または `%APPDATA%\Code\User\mcp.json` (安定版)
- **macOS**: `~/Library/Application Support/Code - Insiders/User/mcp.json` または `~/Library/Application Support/Code/User/mcp.json`
- **Linux**: `~/.config/Code - Insiders/User/mcp.json` または `~/.config/Code/User/mcp.json`

**mcp.jsonの設定例:**

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

**環境変数による設定 (推奨):**

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

この場合、以下の環境変数を設定してください：

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

**秘密鍵認証を使用する場合:**

```bash
# パスワードの代わりに秘密鍵を使用
export UBUNTU_SSH_PRIVATE_KEY_PATH="/path/to/your/private/key"
export UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE="your_passphrase_if_needed"
```

### 4. VS Codeでの使用

1. VS Code（GitHub Copilot有効）を起動
2. Copilotチャットで以下のようにリクエスト：
   - "Ubuntuに接続してシステム情報を取得してください"
   - "docker コマンドを実行してください"
   - "ファイルをアップロードしてビルドを実行してください"

MCPサーバーが自動的に呼び出され、Ubuntu VM上での操作が実行されます。

## 利用可能なMCPツール

### connect_ssh
Ubuntu VMにSSH接続を確立します。パラメータを省略した場合は環境変数から自動取得します。

**パラメータ:**
- `host` (オプション): SSH接続先ホスト（環境変数: `UBUNTU_SSH_HOST`）
- `username` (オプション): SSHユーザー名（環境変数: `UBUNTU_SSH_USERNAME`）
- `port` (オプション): SSHポート（環境変数: `UBUNTU_SSH_PORT`、デフォルト: 22）
- `password` (オプション): パスワード（環境変数: `UBUNTU_SSH_PASSWORD`）
- `private_key` (オプション): 秘密鍵の内容（環境変数: `UBUNTU_SSH_PRIVATE_KEY_PATH`）
- `private_key_passphrase` (オプション): 秘密鍵パスフレーズ（環境変数: `UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE`）

### execute_command
接続されたUbuntu VMでコマンドを実行し、結果を取得します。

**パラメータ:**
- `command` (必須): 実行するシェルコマンド
- `cwd` (オプション): コマンドを実行する作業ディレクトリ

**使用例:**
- システム情報取得: `uname -a`
- Dockerコンテナ実行: `docker run --rm ubuntu echo "Hello World"`
- ファイル操作: `ls -la /home/user`

### upload_file
ローカルファイルをUbuntu VMにアップロードします。

**パラメータ:**
- `local_path` (必須): ローカルのファイルパス
- `remote_path` (必須): アップロード先のVMファイルパス

### download_file  
Ubuntu VMからローカルにファイルをダウンロードします。

**パラメータ:**
- `remote_path` (必須): ダウンロード元のVMファイルパス
- `local_path` (必須): 保存先のローカルファイルパス

### get_system_info
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

### disconnect_ssh
SSH接続を切断し、リソースを解放します。

## 開発・デバッグ

### 開発モードでの実行
```bash
npm run dev
```

### 手動でのMCPサーバーテスト
```bash
# サーバーを直接起動
npm start

# または
node build/index.js
```

### ログ出力の確認
VS Code Copilotでの実行時、MCPサーバーのログはVS Codeの出力パネルで確認できます：
1. VS Codeで `表示` → `出力` を開く
2. ドロップダウンから該当するMCPサーバーを選択

## 実際の使用例

### 基本的なワークフロー
1. **Copilotでの接続指示**
   ```
   "Ubuntu VMに接続してシステム情報を確認してください"
   ```

2. **Docker環境でのビルド実行**
   ```
   "Ubuntuで以下のコマンドを実行してください:
   docker run --rm -v /home/user/project:/workspace ubuntu-dev bash -c 'make build'"
   ```

3. **ファイル転送とリモート実行**
   ```
   "ローカルのconfig.jsonをVMにアップロードして、アプリケーションを起動してください"
   ```

### よくある使用パターン
- **リモート開発環境での作業**: ローカルで編集したファイルをVMにアップロードしてビルド・テスト
- **Dockerコンテナの管理**: VM上でDockerコンテナを起動・停止・管理
- **システム監視**: VM のリソース使用状況やプロセス状態の定期確認
- **自動化スクリプトの実行**: バッチ処理やデプロイスクリプトのリモート実行

## トラブルシューティング

### よくある問題

**SSH接続エラー**
- Ubuntu VMでSSHサーバーが起動しているか確認: `sudo systemctl status ssh`
- ファイアウォール設定の確認: `sudo ufw status`
- VMのネットワーク設定（ポートフォワーディングなど）の確認

**認証エラー**
- 環境変数の値を再確認
- パスワード認証が有効になっているか確認: `/etc/ssh/sshd_config`
- 秘密鍵のパーミッション確認: `chmod 600 ~/.ssh/id_rsa`

**VS Code連携の問題**
- mcp.jsonファイルの場所とJSON構文を確認
- GitHub Copilotが有効になっているか確認
- VS Code を再起動して設定を反映

### ログ確認方法
1. VS Codeの出力パネルでMCPサーバーのログを確認
2. コマンドラインでサーバーを直接実行してデバッグ情報を取得
3. SSH接続の詳細ログが必要な場合は、サーバーコードでログレベルを調整

## システム要件

### ローカル環境
- **Node.js**: 18.0.0 以上
- **VS Code**: GitHub Copilot拡張機能が有効
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)

### Ubuntu VM環境  
- **OS**: Ubuntu 18.04 LTS 以上
- **SSH**: OpenSSH Server (`sudo apt install openssh-server`)
- **ネットワーク**: SSH接続可能な設定（ポート22またはカスタムポート）
- **Docker**: 必要に応じて (`sudo apt install docker.io`)

## ライセンス

MIT License

## 貢献

Issue報告やPull Requestを歓迎します。機能追加や改善提案がある場合は、GitHubのIssueで相談してください。
