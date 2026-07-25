'use client'
import { PropsWithChildren } from 'react'
import BlurredBubblesBackground from './backgrounds/blurred-bubbles'
import NavCard from '@/components/nav-card'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'

const defaultColors = ['#f7da3987', '#8fdbe9', '#fffef8']

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster
        position="bottom-right"
        richColors
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />
        }}
        style={{ '--border-radius': '12px' } as React.CSSProperties}
      />
      <BlurredBubblesBackground colors={defaultColors} />
      <main className="relative z-10 h-full">
        {children}
        <NavCard />
      </main>
    </>
  )
}
