import '@/styles/globals.css'
import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'

export const metadata: Metadata = {
  title: 'AI 简历助手',
  description: '基于 AI 的简历问答网站',
}

const htmlStyle = {
  '--color-brand': '#2fcbe7',
  '--color-primary': '#334f52',
  '--color-secondary': '#8b7667',
  '--color-brand-secondary': '#eec25e',
  '--color-bg': '#d4e8f3',
  '--color-border': '#ffffff',
  '--color-card': '#ffffff99',
  '--color-article': '#ffffffcc',
} as React.CSSProperties

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning style={htmlStyle}>
      <Head />
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
