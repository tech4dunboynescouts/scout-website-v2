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

  // Disable the browser's built-in scroll restoration once on mount.
  // Without this, Android Chrome (and some desktop browsers) replay the saved
  // scroll position AFTER our manual scroll, undoing the fix.
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
  }, [])

  useEffect(() => {
    const scrollToTop = () => {
      // Cover all scroll targets: window, documentElement (Chrome/Firefox),
      // and body (older WebKit / iOS Safari)
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Immediate attempt
    scrollToTop()

    // requestAnimationFrame fires after the browser has painted the new page,
    // which is the point where Android Chrome would otherwise restore the old
    // scroll position — this reliably beats it.
    const raf = requestAnimationFrame(scrollToTop)

    return () => cancelAnimationFrame(raf)
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
