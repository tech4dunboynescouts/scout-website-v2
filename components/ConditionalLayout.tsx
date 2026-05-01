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
    window.scrollTo({ top: 0, behavior: "auto" })
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
