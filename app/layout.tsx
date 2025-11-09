import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jarvis-like Voice Agent',
  description: 'Personal voice AI for daily tasks and marketplace listings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-6xl p-4">{children}</div>
      </body>
    </html>
  )
}
