import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hub Map GH — Ghana Tech Ecosystem Directory',
  description: 'Discover co-working spaces, incubators, accelerators, and makerspaces across Ghana. The definitive map of the Ghanaian tech ecosystem.',
  keywords: 'Ghana tech hubs, Accra startups, Kumasi tech, African innovation, co-working Ghana',
  openGraph: {
    title: 'Hub Map GH',
    description: 'The definitive directory of Ghana\'s tech ecosystem.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
