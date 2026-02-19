import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers/providers"

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
      <body className="antialiased h-screen overflow-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
