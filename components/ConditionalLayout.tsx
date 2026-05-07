"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar, { type NavItem } from "@/components/Navbar"
import Footer from "@/components/Footer"
import CookieNotice from "@/components/CookieNotice"

interface Props {
  children: React.ReactNode
  navItems?: NavItem[]
}

export default function ConditionalLayout({ children, navItems }: Props) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith("/studio")

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    // Immediate attempt
    scrollToTop()

    // Double requestAnimationFrame: the first rAF fires after React's commit,
    // the second fires after the browser has fully settled layout and any
    // scroll restoration — this is the point we reliably win on Android Chrome.
    let raf2: number
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scrollToTop)
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [pathname])

  if (isStudio) return <>{children}</>

  return (
    <>
      <Navbar navItems={navItems} />
      <main>{children}</main>
      <CookieNotice />
      <Footer />
    </>
  )
}
