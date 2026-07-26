import '@/styles/globals.css'
import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'

export const metadata: Metadata = {
  title: '超级简历',
  description: 'AI驱动的智能简历助手，帮助你在求职面试中突出自己，让面试官快速了解你的专业能力和项目经验',
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
