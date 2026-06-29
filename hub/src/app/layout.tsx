import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' })

export const metadata: Metadata = {
  title: 'Crossers Hub',
  description: 'Plataforma de treino e comunidade Crossers — The Hybrid Race',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body>{children}</body>
    </html>
  )
}
