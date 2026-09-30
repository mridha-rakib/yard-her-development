import { Inter } from "next/font/google"
import Navbar from "./component/shared/Navbar"
import "./globals.css"
import LayoutClient from "./LayoutClient"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata = {
  title: "Yard Hero",
  description: "Next.js Multi-role Website",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/yaqrd-main.jpeg",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Navbar />
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  )
}
