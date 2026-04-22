import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Elite Call — Zoom Tracker',
  description: 'Live zoom sales performance tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
