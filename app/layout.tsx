import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Terra Tethers — Trade the World Stage',
  description: 'Simulate trading country coins tied to real geopolitical events. Trade USA, Iran, Israel, and more with $10,000 in fake money.',
  openGraph: {
    title: 'Terra Tethers — Trade the World Stage',
    description: 'The geopolitical paper trading platform. 10 country coins. Real tensions. Fake money.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terra Tethers',
    description: 'Trade country coins tied to real geopolitical events.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
