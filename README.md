# 日本株デモトレード（MVP）

Yahoo Finance の遅延データを利用した日本株デモトレード環境の MVP 実装です。バックエンドが Yahoo Finance から価格情報をポーリングしてキャッシュし、フロントエンドは 10 秒間隔でデータを取得してシミュレーション取引を行います。

## アーキテクチャ概要

```
[Yahoo Finance 公開 API] --fetch--> [Express Cache] --JSON--> [React UI]
                                             |           (Zustand State, LocalStorage)
                                             +-- rate-limit, CORS, error handling
```

- **Frontend**：Vite + React + TypeScript + Zustand + Recharts
- **Backend**：Node.js + Express（Yahoo Finance 公開 API をキャッシュして提供）
- **通信**：REST (JSON)。フロントは 10 秒間隔で `/api/price` と `/api/ohlc` をポーリングします。
- **保存**：LocalStorage（Account / Orders / Trades / Settings）。
- **市場時間**：JST 前場 09:00–11:30、後場 12:30–15:30 のみ価格更新を行います。

## ディレクトリ構成

```
backend/   # Express ベースの軽量プロキシ
frontend/  # Vite + React アプリケーション
```

## バックエンド

Yahoo Finance の非公式公開エンドポイントからチャートデータを取得し、簡易キャッシュを挟んで `/api/price/:symbol` および `/api/ohlc/:symbol` を提供します。

```bash
cd backend
npm install
npm start
```

- `VITE_API_BASE` を `http://localhost:3001` に設定しておくと、フロントエンドからローカルのバックエンドを参照できます。

## フロントエンド

React + Zustand で価格・口座状態を管理し、Recharts でローソク相当のラインチャート、フォームからの成行・指値注文、ポジション／注文／約定テーブルを提供します。

```bash
cd frontend
npm install
npm run dev
```

- `frontend/.env` に `VITE_API_BASE=http://localhost:3001` を設定するとバックエンドと接続できます。
- LocalStorage へ状態を保存し、ページ読み込み時に復元します。

## テスト

フロントエンドでは Vitest を用いたユニットテストを用意し、市場時間ユーティリティと約定ロジックの挙動を確認できます。型チェックを兼ねたビルド検証と合わせて次のコマンドを実行してください。

```bash
cd frontend
npm install
npm run test
npm run build
```

バックエンドについては `npm start` で起動確認を行ってください。

## 主なドメインロジック

- 取引時間チェック (`isWithinJpSession`)、呼値スナップ (`snapToJpTick`)、単元株数制御 (`enforceLot`)
- 成行／指値約定判定、ポジション更新、評価損益・実現損益計算
- 価格取得失敗時のリトライ（10 秒間隔）と警告バナー表示

## 今後の拡張ポイント

- 手数料／スリッページの導入
- 足種・レンジの拡充
- 複数銘柄ウォッチリスト、シグナル連携
- データソースの差し替え（JPX 遅延 API、IBKR など）

## 今回の変更サマリー（日本語）

- 冒険ヘッダーに楽しい雰囲気のティッカーセレクターを追加し、人気銘柄ボタンと手入力の両方で気軽に銘柄を切り替えられるようにしました。
- ゲーム感のあるヘッダーとスタイル群を拡張し、ティッカー選択 UI がデスクトップ／モバイルのどちらでも映えるように調整しました。
- 銘柄変更時にキャッシュ済みの価格データをリセットし、最新の相場を読み込みつつ選択内容をローカルストレージに保存するようにしました。
