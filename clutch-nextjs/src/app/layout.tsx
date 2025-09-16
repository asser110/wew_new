import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import './globals.css'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'block',
  variable: '--font-press-start'
})

export const metadata: Metadata = {
  title: 'Clutch - Welcome',
  description: 'Discord-like platform with retro pixel aesthetics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} bg-black`}>
        {children}
      </body>
    </html>
  )
}