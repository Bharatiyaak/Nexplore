"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"
import { Bell, Shield, Palette, LogOut, ArrowRight } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          setProfile(userDoc.data())
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 glass rounded-lg" />
          ))}
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>

        {/* Account Settings */}
        <Card className="glass-light p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-foreground font-semibold">Email</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-foreground font-semibold">Username</p>
                <p className="text-muted-foreground text-sm">{profile?.username || "Not set"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="glass-light p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Palette size={20} className="text-primary" />
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-semibold">Dark Mode</p>
              <p className="text-muted-foreground text-sm">Enable dark theme</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? "bg-primary" : "bg-muted"}`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  isDark ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="glass-light p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Notifications
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">New Followers</p>
                <p className="text-muted-foreground text-sm">Get notified when someone follows you</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">Post Likes</p>
                <p className="text-muted-foreground text-sm">Get notified when someone likes your post</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">Comments</p>
                <p className="text-muted-foreground text-sm">Get notified when someone comments on your post</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass-light p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Privacy & Security
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 hover:bg-primary/10 rounded-lg transition-colors">
              <span className="text-foreground font-semibold">Change Password</span>
              <ArrowRight size={18} className="text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-primary/10 rounded-lg transition-colors">
              <span className="text-foreground font-semibold">Two-Factor Authentication</span>
              <ArrowRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="glass-light p-6 space-y-4 border-destructive/20">
          <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="w-full bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg py-3 font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
