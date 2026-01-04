"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit2, TrendingUp, Users } from "lucide-react"

interface ContentStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  followers: number
  engagement: number
}

export default function CreatorSpacePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    bio: "",
    website: "",
    location: "",
  })

  useEffect(() => {
    if (!user) return

    const fetchCreatorData = async () => {
      try {
        // Fetch user profile
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setProfile(userData)
          setEditData({
            bio: userData.bio || "",
            website: userData.website || "",
            location: userData.location || "",
          })

          // Fetch content stats
          const postsQuery = query(collection(db, "posts"), where("authorId", "==", user.uid))
          const postsSnapshot = await getDocs(postsQuery)

          let totalLikes = 0
          let totalComments = 0

          for (const postDoc of postsSnapshot.docs) {
            const postData = postDoc.data()
            totalLikes += postData.likes || 0

            const commentsQuery = query(collection(db, "comments"), where("postId", "==", postDoc.id))
            const commentsSnapshot = await getDocs(commentsQuery)
            totalComments += commentsSnapshot.size
          }

          const followers = userData.followers?.length || 0
          const engagement = followers > 0 ? Math.round((totalLikes + totalComments) / followers) : 0

          setStats({
            totalPosts: postsSnapshot.size,
            totalLikes,
            totalComments,
            followers,
            engagement,
          })
        }
      } catch (error) {
        console.error("Error fetching creator data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCreatorData()
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        bio: editData.bio,
        website: editData.website,
        location: editData.location,
      })

      setProfile((prev) => ({
        ...prev,
        bio: editData.bio,
        website: editData.website,
        location: editData.location,
      }))

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

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

  if (!profile || !stats) {
    return (
      <ProtectedLayout>
        <Card className="text-center p-8 text-muted-foreground">Failed to load creator space</Card>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Creator Space</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-primary/20 hover:bg-primary/30 text-primary rounded-lg flex items-center gap-2"
          >
            <Edit2 size={18} />
            Edit Profile
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="glass-light p-8 space-y-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/30">
              <AvatarImage src={profile.profileImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.username}</h2>
                <p className="text-muted-foreground">Level {profile.level}</p>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    placeholder="Bio"
                    value={editData.bio}
                    onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full glass bg-card/50 border-primary/20 rounded-lg p-3 text-foreground placeholder:text-muted-foreground"
                    rows={2}
                  />
                  <input
                    placeholder="Location"
                    value={editData.location}
                    onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full glass bg-card/50 border-primary/20 rounded-lg p-3 text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    placeholder="Website"
                    value={editData.website}
                    onChange={(e) => setEditData((prev) => ({ ...prev, website: e.target.value }))}
                    className="w-full glass bg-card/50 border-primary/20 rounded-lg p-3 text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground">{profile.bio || "No bio yet"}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="glass-light p-6 text-center space-y-2">
            <p className="text-3xl font-bold text-primary">{stats.totalPosts}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </Card>
          <Card className="glass-light p-6 text-center space-y-2">
            <p className="text-3xl font-bold text-secondary">{stats.totalLikes}</p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </Card>
          <Card className="glass-light p-6 text-center space-y-2">
            <p className="text-3xl font-bold text-accent">{stats.totalComments}</p>
            <p className="text-sm text-muted-foreground">Comments</p>
          </Card>
          <Card className="glass-light p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Users size={20} className="text-primary" />
              <p className="text-3xl font-bold text-primary">{stats.followers}</p>
            </div>
            <p className="text-sm text-muted-foreground">Followers</p>
          </Card>
          <Card className="glass-light p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={20} className="text-secondary" />
              <p className="text-3xl font-bold text-secondary">{stats.engagement}</p>
            </div>
            <p className="text-sm text-muted-foreground">Engagement</p>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="glass-light p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Performance Insights</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Overall Engagement</span>
                <span className="text-primary font-bold">{stats.engagement} per follower</span>
              </div>
              <div className="w-full bg-card/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary rounded-full h-2"
                  style={{ width: `${Math.min((stats.engagement / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Content Activity</span>
                <span className="text-secondary font-bold">{stats.totalPosts} posts</span>
              </div>
              <div className="w-full bg-card/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-secondary to-accent rounded-full h-2"
                  style={{ width: `${Math.min((stats.totalPosts / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold">Tips to grow your presence:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Post consistently to build audience trust</li>
              <li>Engage with your community through comments</li>
              <li>Use relevant content to attract new followers</li>
            </ul>
          </div>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
