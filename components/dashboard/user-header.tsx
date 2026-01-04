"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface UserProfile {
  username: string
  level: number
  xp: number
  badges: string[]
  profileImage?: string
}

export function UserHeader() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  if (loading) {
    return <div className="h-20 glass rounded-lg animate-pulse" />
  }

  if (!profile) {
    return null
  }

  return (
    <Card className="glass-light p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/30">
          <AvatarImage src={profile.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
            {profile.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-foreground">{profile.username}</h2>
          <p className="text-sm text-muted-foreground">Level {profile.level}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total XP</p>
          <p className="text-lg font-bold text-primary">{profile.xp}</p>
        </div>
      </div>
    </Card>
  )
}
