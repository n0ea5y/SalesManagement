# ベースイメージ
FROM node:lts-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 必要なツールを追加（bash + firebase-tools）
RUN apk update && apk add --no-cache bash && \
    npm install -g firebase-tools

# 依存ファイルを先にコピー（キャッシュ利用のため）
COPY ./app/package.json ./app/yarn.lock ./

# パッケージをインストール
RUN yarn install

# アプリケーションのソースをコピー
COPY ./app ./

# 開発サーバーを起動（ポートホスト対応）
CMD ["yarn", "dev", "--host"]