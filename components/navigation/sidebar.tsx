"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Home, Search, Sparkles, Users, Trophy, Settings, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: "/dashboard", label: "Feed", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/trending", label: "Trending", icon: Sparkles },
    { href: "/community", label: "Community", icon: Users },
    { href: "/achievements", label: "Achievements", icon: Trophy },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass glow-primary"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 glass-light border-r border-primary/20 p-6 flex flex-col transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40`}
      >
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 mt-16 lg:mt-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <span className="text-2xl font-bold text-foreground">Nexplore</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <button
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(href)
                    ? "bg-primary/20 text-primary glow-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </button>
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-primary/10 pt-4">
          <Link href="/creator-space">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary rounded-lg px-4 py-3 font-semibold transition-all glow-primary flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Creator Space
            </button>
          </Link>

          <Link href="/settings">
            <button
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive("/settings")
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
          </Link>

          <Button
            onClick={handleLogout}
            className="w-full bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
