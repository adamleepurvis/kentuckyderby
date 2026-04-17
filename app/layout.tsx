import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RaceBet',
  description: 'Live race betting with real-time odds',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-emerald-700 hover:text-emerald-800">
            RaceBet
          </a>
          <a href="/races" className="text-sm text-gray-600 hover:text-gray-900">Races</a>
          <a href="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900">Leaderboard</a>
          <div className="ml-auto">
            <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Admin</a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
