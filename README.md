# AI Resume Assistant

基于 AI 的简历问答网站

## 功能特性

- 简历上传与解析（支持 JSON、Markdown、PDF）
- AI 智能问答
- 技能雷达图展示
- 工作经历时间线
- 快捷提问功能

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- pdfjs-dist（PDF 解析）

## 安装与运行

```bash
npm install
npm run dev
```

开发服务器将运行在 http://localhost:2025

## 项目结构

```
src/
├── app/              # Next.js App Router
├── components/       # 组件
├── layout/           # 布局组件
├── lib/              # 工具函数和服务
└── styles/           # 样式文件
```