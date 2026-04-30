# 🐾 Pace - 情侣养成 App

和 TA 一起养一只专属宠物。

## 项目结构

```
pace/
├── frontend/          # Vue3 前端 → 部署到 GitHub Pages
├── backend/           # Node.js API → 部署到 Render.com
├── supabase/
│   └── init.sql       # 数据库初始化 SQL
└── .github/
    └── workflows/
        └── deploy.yml # 自动部署工作流
```

## 快速开始

### 1. 初始化 Supabase

1. 访问 [supabase.com](https://supabase.com) 新建项目
2. 在 SQL Editor 中执行 `supabase/init.sql`
3. 在 Project Settings → API 中获取：
   - `URL`（SUPABASE_URL）
   - `anon public key`（SUPABASE_ANON_KEY）
   - `service_role key`（SUPABASE_SERVICE_KEY，**仅后端使用**）

### 2. 获取 DeepSeek API Key

1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册账号 → API Keys → 创建新 Key（国内直连，免费额度充足）

### 3. 启动后端（本地开发）

```bash
cd backend
cp .env.example .env  # 填入 Supabase 和 Gemini 配置
npm run dev
```

### 4. 启动前端（本地开发）

```bash
cd frontend
cp .env.example .env.local  # 填入 Supabase 和 API 地址
npm run dev
```

## 部署

### 前端 → GitHub Pages

1. 在 GitHub 仓库 Settings → Pages → 选择 GitHub Actions
2. 在 Settings → Secrets 中添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL`（Render.com 服务地址）
3. 推送到 `main` 分支，自动触发部署

### 后端 → Render.com

1. 访问 [render.com](https://render.com) 新建 Web Service
2. 连接 GitHub 仓库，根目录设为 `backend`
3. 启动命令：`npm start`
4. 添加环境变量（同 `.env.example`）

## 核心功能

- 🔐 邮箱注册/登录（Supabase Auth）
- 💌 邀请码绑定情侣关系（一次性）
- 🐱 共养一只宠物（喂食、抚摸、AI 对话）
- 💕 实时同步（Supabase Realtime）
- 📖 绑定历史记录
