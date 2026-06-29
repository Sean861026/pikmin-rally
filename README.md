# 🍄 皮克敏揪人 | Pikmin Rally | ピクミン集合

找附近的 Pikmin Bloom 玩家一起打大型蘑菇。
Find nearby Pikmin Bloom players to beat large mushrooms together.

**Live App → https://pikmin-rally.vercel.app**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/sean-hung/pikmin-rally/H78hSXXvfJshM3khtNYdz26eyS9V)

## 功能 / Features

- 🗺️ 在地圖上標記蘑菇位置並發起揪人
- 👥 設定蘑菇等級、集合時間、需要人數
- 🔗 每個活動有獨立分享連結，可貼到 LINE 群組
- 🧭 一鍵跳轉 Google Maps 導航到蘑菇位置
- ⏰ 過了集合時間自動關閉活動
- 🌏 支援全球多地區（各地玩家各自使用）
- 📱 PWA — 可安裝到手機桌面像 App 一樣使用
- 🌐 多語言介面（繁體中文 / English / 日本語）
- 🔓 不需要登入，完全匿名使用

## 使用方式

1. 打開 App，允許定位
2. 點右上角「發起揪人」
3. 點地圖上蘑菇的位置
4. 填入暱稱、蘑菇等級、集合時間
5. 發布後分享連結給朋友，或讓附近玩家在地圖上找到並加入

## 技術架構

| 項目 | 技術 |
|------|------|
| 前端 | Next.js 15 + TypeScript + Tailwind CSS |
| 地圖 | Leaflet + OpenStreetMap |
| 資料庫 | Supabase (PostgreSQL) |
| 部署 | Vercel |

全部免費方案，無需信用卡。

## 本地開發

```bash
# 安裝套件
npm install

# 設定環境變數
# 建立 .env.local 並填入以下內容
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 啟動開發伺服器
npm run dev
```

## Supabase 設定

在 Supabase SQL Editor 執行 `supabase-schema.sql` 建立資料表。

## 支持開發者 / Support

如果這個 App 對你有幫助，歡迎請我喝杯咖啡 ☕

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-blue?logo=paypal)](https://paypal.me/SeanSHHung)
