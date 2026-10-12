import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
