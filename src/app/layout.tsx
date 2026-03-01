import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://hubmapgh.vercel.app'),
  title: 'Hub Map GH | Ghana Tech Ecosystem Directory',
  description: "The definitive community-maintained directory of tech spaces powering Ghana's innovation ecosystem. Built with Gemini AI and Firebase.",
  openGraph: {
    title: 'Hub Map GH',
    description: "Ghana's Tech Ecosystem Directory",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Map GH',
    description: "Ghana's Tech Ecosystem Directory",
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
