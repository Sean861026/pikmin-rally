# 🍄 皮克敏揪人 | Pikmin Rally | ピクミン集合

**Live App → https://pikmin-rally.vercel.app**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/sean-hung/pikmin-rally/H78hSXXvfJshM3khtNYdz26eyS9V)

---

## 繁體中文

找附近的 Pikmin Bloom 玩家一起打大型蘑菇。

### 功能
- 🗺️ 在地圖上標記蘑菇位置並發起揪人
- 👥 設定蘑菇等級、集合時間、需要人數
- 🔗 每個活動有獨立分享連結，可貼到 LINE 群組
- 🧭 一鍵跳轉 Google Maps 導航到蘑菇位置
- ⏰ 過了集合時間自動關閉活動
- 🌏 支援全球多地區，各地玩家各自使用
- 📱 PWA — 可安裝到手機桌面像 App 一樣使用
- 🌐 多語言介面（繁體中文 / English / 日本語）
- 🔓 不需要登入，完全匿名使用

### 使用方式
1. 打開 App，允許定位
2. 點右上角「發起揪人」
3. 點地圖上蘑菇的位置
4. 填入暱稱、蘑菇等級、集合時間
5. 發布後分享連結給朋友，或讓附近玩家在地圖上找到並加入

---

## English

Find nearby Pikmin Bloom players to beat large mushrooms together.

### Features
- 🗺️ Pin mushroom locations on the map and create a rally
- 👥 Set mushroom level, meet time, and player count
- 🔗 Each event has a shareable link you can send to your group
- 🧭 One-tap Google Maps navigation to the mushroom location
- ⏰ Events auto-close after the scheduled time passes
- 🌏 Works globally — players in each region see local events
- 📱 PWA — install to your home screen like a native app
- 🌐 Multilingual UI (繁體中文 / English / 日本語)
- 🔓 No login required, fully anonymous

### How to use
1. Open the app and allow location access
2. Tap "New Rally" in the top right
3. Tap the mushroom location on the map
4. Enter your nickname, mushroom level, and meet time
5. Share the link with friends, or let nearby players find it on the map

---

## 日本語

近くの Pikmin Bloom プレイヤーと一緒に大きなキノコを倒そう。

### 機能
- 🗺️ 地図でキノコの場所をマークして集合を作成
- 👥 キノコレベル・集合時間・必要人数を設定
- 🔗 各イベントに共有リンクあり、グループに送れる
- 🧭 ワンタップで Google マップ案内
- ⏰ 集合時間を過ぎたイベントは自動終了
- 🌏 世界中で利用可能 — 各地のプレイヤーが近くのイベントを確認
- 📱 PWA — ホーム画面に追加してアプリのように使える
- 🌐 多言語対応（繁體中文 / English / 日本語）
- 🔓 ログイン不要、完全匿名

### 使い方
1. アプリを開き、位置情報を許可
2. 右上の「集合を作る」をタップ
3. 地図でキノコの場所をタップ
4. ニックネーム・キノコレベル・集合時間を入力
5. リンクを友達に送るか、近くのプレイヤーが地図で見つけるのを待つ

---

## Tech Stack

| | |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Map | Leaflet + OpenStreetMap |
| Database | Supabase (PostgreSQL) |
| Deploy | Vercel |

All free tier — no credit card required.

## Local Development

```bash
npm install

# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run dev
```

Run `supabase-schema.sql` in Supabase SQL Editor to set up the database.

## Support / 支持 / サポート

☕ If this app helped you, feel free to buy me a coffee!

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-blue?logo=paypal)](https://paypal.me/SeanSHHung)
