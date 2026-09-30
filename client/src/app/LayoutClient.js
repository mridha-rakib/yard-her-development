"use client"

import { usePathname } from "next/navigation"
import AuthBootstrap from "@/components/auth/AuthBootstrap"
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents"
import Footer from "./component/shared/Footer"

const FOOTER_VISIBLE_PATHS = new Set([
  "/",
  "/about",
  "/how-it-works",
  "/pricing",
  "/book",
  "/contact",
  "/testimonials",
  ...LEGAL_DOCUMENTS.map((document) => document.href),
])

export default function LayoutClient({ children }) {
  const pathname = usePathname()
  const shouldShowFooter = FOOTER_VISIBLE_PATHS.has(pathname)

  return (
    <>
      <AuthBootstrap />
      {children}
      {shouldShowFooter ? <Footer /> : null}
    </>
  )
}
