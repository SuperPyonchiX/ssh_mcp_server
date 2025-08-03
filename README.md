# VirtualBox Ubuntu MCP Server

VirtualBoxのUbuntu仮想マシンをSSH経由で操作するためのMCPサーバーです。AIエージェントがUbuntu VMに接続してコマンドを実行したり、ファイルの転送を行うことができます。

## 機能

- **SSH接続**: UbuntuVMへのSSH接続（パスワード認証または秘密鍵認証）
- **環境変数サポート**: 接続情報を環境変数で安全に管理
- **コマンド実行**: リモートでのコマンド実行
- **ファイル転送**: アップロード・ダウンロード機能
- **システム情報取得**: VM の状態やリソース情報の取得

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
`.env.example`を`.env`にコピーして、接続情報を設定してください。

```bash
cp .env.example .env
```

`.env`ファイルの例:
```env
UBUNTU_SSH_HOST=192.168.1.100
UBUNTU_SSH_PORT=22
UBUNTU_SSH_USERNAME=ubuntu
UBUNTU_SSH_PASSWORD=your_password_here

# 秘密鍵認証を使用する場合（パスワードの代わり）
# UBUNTU_SSH_PRIVATE_KEY_PATH=/path/to/your/private/key
# UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE=your_passphrase_here
```

3. TypeScriptのコンパイル:
```bash
npm run build
```

4. MCP設定ファイルの調整:
`.vscode/mcp.json`ファイルの`env`プロパティに実際の接続情報を設定してください。

```json
{
  "servers": {
    "ssh-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "UBUNTU_SSH_HOST": "192.168.1.100",
        "UBUNTU_SSH_PORT": "22",
        "UBUNTU_SSH_USERNAME": "ubuntu",
        "UBUNTU_SSH_PASSWORD": "your_password_here"
      }
    }
  }
}
```

5. サーバーの起動:
```bash
npm start
```

## 利用可能なツール

### connect_ssh
Ubuntu VMにSSH接続を確立します。パラメータが指定されない場合は環境変数を使用します。

**パラメータ:**
- `host` (オプション): SSH接続先のホストアドレス（環境変数: `UBUNTU_SSH_HOST`）
- `username` (オプション): SSHユーザー名（環境変数: `UBUNTU_SSH_USERNAME`）
- `port` (オプション): SSHポート（環境変数: `UBUNTU_SSH_PORT`、デフォルト: 22）
- `password` (オプション): パスワード（環境変数: `UBUNTU_SSH_PASSWORD`）
- `privateKey` (オプション): 秘密鍵の内容（環境変数: `UBUNTU_SSH_PRIVATE_KEY_PATH`でファイルパス指定）
- `privateKeyPassphrase` (オプション): 秘密鍵のパスフレーズ（環境変数: `UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE`）

### connect_ssh_env
環境変数のみを使用してUbuntu VMにSSH接続を確立します。パラメータは不要です。

### execute_command
接続されたUbuntu VMでコマンドを実行します。

**パラメータ:**
- `command` (必須): 実行するコマンド
- `cwd` (オプション): 作業ディレクトリ

### upload_file
ローカルファイルをUbuntu VMにアップロードします。

**パラメータ:**
- `localPath` (必須): ローカルファイルパス
- `remotePath` (必須): リモートファイルパス

### download_file
Ubuntu VMからローカルにファイルをダウンロードします。

**パラメータ:**
- `remotePath` (必須): リモートファイルパス
- `localPath` (必須): ローカルファイルパス

### get_system_info
Ubuntu VMのシステム情報を取得します。

### disconnect_ssh
SSH接続を切断します。

## 開発

開発モードで実行:
```bash
npm run dev
```

## 使用例

### 環境変数を使用した簡単な接続
1. `.env`ファイルに接続情報を設定
2. `connect_ssh_env` で接続（パラメータ不要）
3. `execute_command` でコマンドを実行

### パラメータを指定した接続
1. `connect_ssh` で接続情報をパラメータで指定
2. `execute_command` でコマンドを実行
3. 必要に応じて `upload_file` や `download_file` でファイルを転送
4. 作業完了後は `disconnect_ssh` で接続を切断

## 注意事項

- SSH接続の認証情報は安全に管理してください
- VirtualBox VMのネットワーク設定でSSHアクセスが有効になっている必要があります
- Ubuntu VMでSSHサーバー（openssh-server）がインストールされ、起動している必要があります
