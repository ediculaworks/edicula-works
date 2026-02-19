import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "EdiculaWorks",
  description: "Sistema interno de gestão com IA",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
