# Docker環境での起動方法

## 開発環境での起動

開発環境では、ローカルのPostgreSQLとRedisを使用します。

### 初回起動

```bash
docker-compose up --build -d
```

### 通常の起動

```bash
docker-compose up -d
```

### ログの確認

```bash
docker-compose logs -f app
```

### 停止

```bash
docker-compose down
```

## 重要な注意事項

**開発環境では、`.env`ファイルの`DATABASE_URL`がdocker-compose.ymlのデフォルト値を上書きします。**

開発環境でローカルのPostgreSQLを使うには、以下のいずれかの方法を使用してください：

1. **`.env`ファイルを一時的にリネームする（推奨）**
   ```bash
   mv .env .env.backup
   docker-compose up -d
   ```

2. **環境変数を無視して起動する**
   ```bash
   env -u DATABASE_URL -u DIRECT_URL docker-compose up -d
   ```

3. **開発環境用のdocker-composeファイルを使う**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

## 本番環境（fly.io）

本番環境では、環境変数`DATABASE_URL`にSupabaseの接続文字列を設定します。
fly.ioでは、環境変数をシークレットとして設定してください。

```bash
fly secrets set DATABASE_URL="postgresql://..."
```
