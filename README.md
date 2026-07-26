# AI Resume Assistant

基于 AI 的智能简历问答助手，帮助用户快速解析简历并进行智能问答。

## ✨ 功能特性

### 📄 简历上传与解析
- **PDF 简历上传**：支持上传 PDF 格式的简历文件
- **AI 智能解析**：使用豆包 API 智能提取简历中的结构化信息
- **多格式支持**：支持各种格式的简历文本，不受固定模板限制

### 🤖 AI 简历助手
- **智能问答**：基于简历内容回答任何问题（介绍自己、项目经历、技术栈等）
- **快捷提问**：提供预设的快捷问题按钮，一键提问
- **聊天记录**：自动保存聊天历史，方便回顾

### 📊 数据可视化
- **技能雷达图**：展示个人技能分布和熟练度
- **工作经历时间线**：清晰展示职业发展历程
- **项目卡片**：展示项目经历和技术栈

### 🎨 界面功能
- **头像上传**：支持点击上传个人头像，实时预览
- **简历图片预览**：工作经历模块可切换为简历图片视图
- **全屏查看**：点击图片可全屏放大查看，支持 ESC 退出

### 🗣️ 模拟面试
- **面试题库**：包含技术、行为、项目等多种类型的面试题
- **AI 评分**：基于回答内容自动评分和给出反馈建议

## 🛠️ 技术栈

- **前端框架**：Next.js 16.0.10 (App Router + Turbopack)
- **UI 语言**：React 19 + TypeScript
- **样式**：Tailwind CSS 4
- **图标**：Lucide React
- **动画**：Framer Motion
- **状态管理**：React Hooks (useState, useEffect)
- **PDF 解析**：pdf-parse
- **AI 服务**：豆包 API (火山引擎)
- **部署**：Cloudflare (可选)

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── chat/          # 聊天接口
│   │   ├── parse/         # AI 解析接口
│   │   ├── parse-pdf/     # PDF 解析接口
│   │   ├── preview-pdf/   # PDF 预览接口
│   │   ├── resume/        # 简历数据接口
│   │   └── upload/        # 文件上传接口
│   ├── contact/           # 联系方式页面
│   ├── history/           # 聊天历史页面
│   ├── interview/         # 模拟面试页面
│   ├── projects/          # 项目展示页面
│   ├── resume/            # 简历主页面
│   └── layout.tsx         # 全局布局
├── components/            # 组件目录
│   └── resume/            # 简历相关组件
│       ├── ChatInterface.tsx    # AI 聊天界面
│       ├── ChatMessage.tsx      # 聊天消息组件
│       ├── ContactInfo.tsx      # 联系信息组件
│       ├── FileUpload.tsx       # 文件上传组件
│       ├── HistoryList.tsx      # 历史记录列表
│       ├── QuickQuestions.tsx   # 快捷提问组件
│       ├── ResumeProjectCard.tsx # 项目卡片组件
│       ├── SkillRadar.tsx       # 技能雷达图
│       ├── Timeline.tsx         # 时间线组件
│       └── TypewriterText.tsx   # 打字机效果组件
├── layout/                # 布局组件
│   ├── backgrounds/       # 背景动画
│   ├── footer.tsx         # 页脚
│   ├── head.tsx           # 页面头部
│   ├── header.tsx         # 导航头部
│   └── index.tsx          # 主布局
├── lib/                   # 工具函数和服务
│   ├── ai-service.ts      # AI 服务（解析+聊天）
│   ├── chat-history-store.ts  # 聊天历史存储
│   ├── chat-store.ts      # 当前聊天存储
│   ├── file-utils.ts      # 文件工具函数
│   ├── resume-parser.ts   # 传统简历解析器（备用）
│   ├── resume-store.ts    # 简历数据存储
│   ├── types.ts           # TypeScript 类型定义
│   └── utils.ts           # 通用工具函数
└── styles/                # 样式文件
    ├── globals.css        # 全局样式
    └── theme.css          # 主题变量

public/
├── data/                  # 简历数据
│   └── resume.json        # 默认简历数据
└── images/                # 静态图片资源
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
# 豆包 API 配置（推荐）
DOUBAO_API_KEY=你的豆包API密钥
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=doubao-seed-2-0-lite-260428

# OpenAI API 配置（可选）
# NEXT_PUBLIC_OPENAI_API_KEY=你的OpenAI密钥
# NEXT_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
# NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
```

### 获取豆包 API 密钥

1. 访问 [火山引擎控制台](https://console.volces.com/)
2. 搜索并进入 **豆包大模型服务**
3. 创建 **API 密钥**（Access Key）
4. 在 **接入点管理** 中创建接入点，获取接入点 ID（用于 DOUBBAO_MODEL）

### 启动开发服务器

```bash
npm run dev
```

开发服务器将运行在 http://localhost:2025

### 构建生产版本

```bash
npm run build
npm run start
```

## 📖 使用指南

### 上传简历

1. 在简历页面点击头像区域上传个人头像
2. 使用文件上传组件上传 PDF 简历
3. AI 将自动解析简历内容并填充到页面中

### 与 AI 助手对话

1. 在 AI 简历助手输入框中输入问题
2. 或点击快捷提问按钮快速提问
3. AI 将基于简历内容给出专业回答

### 查看项目

1. 点击顶部导航的 **项目** 标签
2. 查看解析出的项目经历和技术栈

### 模拟面试

1. 点击顶部导航的 **面试** 标签
2. 选择面试问题并回答
3. AI 将自动评分并给出反馈

## 🔧 API 接口

### 解析简历

```
POST /api/parse
Content-Type: application/json

{
  "text": "简历文本内容",
  "useAI": true
}
```

### PDF 解析

```
POST /api/parse-pdf
Content-Type: multipart/form-data

file: <PDF文件>
```

### AI 聊天

```
POST /api/chat
Content-Type: application/json
Accept: text/event-stream

{
  "messages": [
    {"role": "user", "content": "介绍你的项目"}
  ]
}
```

## 📝 简历数据格式

```json
{
  "personal": {
    "name": "姓名",
    "title": "职位",
    "email": "邮箱",
    "phone": "电话",
    "location": "城市",
    "avatar": "头像URL"
  },
  "summary": "个人简介",
  "skills": [
    {"name": "技能名称", "level": 80, "category": "前端"}
  ],
  "experience": [
    {
      "company": "公司名称",
      "position": "职位",
      "startDate": "2023-01",
      "endDate": "2024-12",
      "description": "工作描述",
      "highlights": ["职责1", "职责2"]
    }
  ],
  "education": [
    {
      "school": "学校名称",
      "degree": "本科",
      "field": "专业",
      "startDate": "2019-09",
      "endDate": "2023-06"
    }
  ],
  "projects": [
    {
      "name": "项目名称",
      "description": "项目描述",
      "technologies": ["技术1", "技术2"],
      "url": ""
    }
  ],
  "contact": {
    "email": "邮箱",
    "github": "",
    "linkedin": "",
    "twitter": "",
    "website": ""
  }
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！