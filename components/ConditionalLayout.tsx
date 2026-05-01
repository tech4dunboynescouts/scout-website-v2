"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar, { type NavItem } from "@/components/Navbar"
import Footer from "@/components/Footer"

interface Props {
  children: React.ReactNode
  navItems?: NavItem[]
}

export default function ConditionalLayout({ children, navItems }: Props) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith("/studio")

  useEffect(() => {
    // Scroll to top on navigation — multiple methods for cross-browser/iOS Safari compatibility
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    // Deferred attempt covers cases where iOS Safari resets scroll after React's render
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])

  if (isStudio) return <>{children}</>

  return (
    <>
      <Navbar navItems={navItems} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
