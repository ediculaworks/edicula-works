"use client"

import { useEffect } from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable any page transitions
  }, [])
  
  return <>{children}</>
}
