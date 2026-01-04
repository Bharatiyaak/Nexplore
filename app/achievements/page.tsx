"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"
import { calculateLevelProgress, BADGE_CONDITIONS, LEVELS } from "@/lib/xp-system"

export default function AchievementsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  useEffect(() => {
    if (!user) return

    const fetchAchievements = async () => {
      try {
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setProfile(userData)

          // Count posts and total likes
          const postsQuery = query(collection(db, "posts"), where("authorId", "==", user.uid))
          const postsSnapshot = await getDocs(postsQuery)
          let totalLikes = 0

          postsSnapshot.docs.forEach((post) => {
            totalLikes += post.data().likes || 0
          })

          // Check earned badges
          const badges: string[] = []
          const stats = {
            posts: postsSnapshot.size,
            likes: totalLikes,
            followers: userData.followers?.length || 0,
          }

          Object.entries(BADGE_CONDITIONS).forEach(([key, badge]: any) => {
            const condition = badge.condition
            let isMet = false

            if (condition.includes("posts")) {
              const minPosts = Number.parseInt(condition.match(/\d+/)[0])
              isMet = stats.posts >= minPosts
            } else if (condition.includes("likes")) {
              const minLikes = Number.parseInt(condition.match(/\d+/)[0])
              isMet = stats.likes >= minLikes
            } else if (condition.includes("followers")) {
              const minFollowers = Number.parseInt(condition.match(/\d+/)[0])
              isMet = stats.followers >= minFollowers
            }

            if (isMet) {
              badges.push(key)
            }
          })

          setEarnedBadges(badges)
        }
      } catch (error) {
        console.error("Error fetching achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [user])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-12 glass rounded-lg" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 glass rounded-lg" />
            ))}
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (!profile) {
    return (
      <ProtectedLayout>
        <Card className="text-center p-8 text-muted-foreground">Profile not found</Card>
      </ProtectedLayout>
    )
  }

  const levelInfo = calculateLevelProgress(profile.xp)

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Your Achievements</h1>

        {/* Level Card */}
        <Card className="glass-light p-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-primary">{levelInfo.levelName}</h2>
              <p className="text-muted-foreground">Level {levelInfo.currentLevel}</p>
            </div>
            <div className="text-4xl font-bold text-secondary">{profile.xp}</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress to next level</span>
              <span>
                {profile.xp} / {levelInfo.nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-card/50 rounded-full h-3">
              <div
                className
                className="bg-gradient-to-r from-primary to-secondary rounded-full h-3 transition-all"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Earn XP by creating posts, getting likes, and building your community!
          </p>
        </Card>

        {/* Badges */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(BADGE_CONDITIONS).map(([key, badge]: any) => {
              const isEarned = earnedBadges.includes(key)

              return (
                <Card
                  key={key}
                  className={`glass-light p-6 text-center space-y-3 transition-all ${
                    isEarned ? "border-primary/50 bg-primary/5" : "opacity-50"
                  }`}
                >
                  <div className="text-4xl">{badge.icon}</div>
                  <h3 className="font-semibold text-foreground text-sm">{badge.name}</h3>
                  {!isEarned && <p className="text-xs text-muted-foreground">Locked</p>}
                  {isEarned && <p className="text-xs text-primary font-semibold">Earned!</p>}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Level Tiers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Level Tiers</h2>
          <div className="space-y-3">
            {LEVELS.map((tier) => (
              <Card
                key={tier.level}
                className={`glass-light p-4 flex items-center justify-between ${
                  tier.level === levelInfo.currentLevel ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <div>
                  <h3 className="font-semibold text-foreground">Level {tier.level}</h3>
                  <p className="text-sm text-muted-foreground">{tier.name}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {tier.minXp} - {tier.maxXp} XP
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
