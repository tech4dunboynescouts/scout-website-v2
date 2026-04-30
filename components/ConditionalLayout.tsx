"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith("/studio")

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  if (isStudio) return <>{children}</>

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
