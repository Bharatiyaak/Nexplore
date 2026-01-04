"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2, MapPin, LinkIcon } from "lucide-react"

interface ProfileData {
  uid: string
  username: string
  bio: string
  profileImage?: string
  coverImage?: string
  location?: string
  website?: string
  followers: string[]
  following: string[]
  xp: number
  level: number
  postCount: number
}

interface ProfileHeaderProps {
  userId: string
}

export function ProfileHeader({ userId }: ProfileHeaderProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ bio: "", website: "", location: "" })
  const isOwnProfile = user?.uid === userId

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRef = doc(db, "users", userId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfile({
            uid: userId,
            username: data.username || "",
            bio: data.bio || "",
            profileImage: data.profileImage || "",
            coverImage: data.coverImage || "",
            location: data.location || "",
            website: data.website || "",
            followers: data.followers || [],
            following: data.following || [],
            xp: data.xp || 0,
            level: data.level || 1,
            postCount: 0,
          })

          setEditData({
            bio: data.bio || "",
            website: data.website || "",
            location: data.location || "",
          })

          if (user?.uid && user.uid !== userId) {
            setIsFollowing(data.followers?.includes(user.uid) || false)
          }

          // Count user's posts
          const postsQuery = query(collection(db, "posts"), where("authorId", "==", userId))
          const postsSnapshot = await getDocs(postsQuery)
          const count = postsSnapshot.size

          setProfile((prev) => (prev ? { ...prev, postCount: count } : null))
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, user])

  const handleFollow = async () => {
    if (!user || !profile) return

    try {
      const userRef = doc(db, "users", userId)
      const currentUserRef = doc(db, "users", user.uid)

      if (isFollowing) {
        // Unfollow
        const newFollowers = profile.followers.filter((id) => id !== user.uid)
        await updateDoc(userRef, { followers: newFollowers })

        // Update current user's following list
        const currentUserDoc = await getDoc(currentUserRef)
        const following = currentUserDoc.data()?.following || []
        const newFollowing = following.filter((id: string) => id !== userId)
        await updateDoc(currentUserRef, { following: newFollowing })
      } else {
        // Follow
        const newFollowers = [...profile.followers, user.uid]
        await updateDoc(userRef, { followers: newFollowers })

        // Update current user's following list
        const currentUserDoc = await getDoc(currentUserRef)
        const following = currentUserDoc.data()?.following || []
        const newFollowing = [...following, userId]
        await updateDoc(currentUserRef, { following: newFollowing })
      }

      setIsFollowing(!isFollowing)
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          followers: isFollowing ? prev.followers.filter((id) => id !== user.uid) : [...prev.followers, user.uid],
        }
      })
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        bio: editData.bio,
        website: editData.website,
        location: editData.location,
      })

      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          bio: editData.bio,
          website: editData.website,
          location: editData.location,
        }
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  if (loading) {
    return <Card className="glass-light p-8 h-64 animate-pulse" />
  }

  if (!profile) {
    return <Card className="glass-light p-8 text-center text-muted-foreground">User not found</Card>
  }

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="h-40 glass-light rounded-lg overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20" />

      {/* Profile Card */}
      <Card className="glass-light p-6 space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24 border-4 border-primary/30">
            <AvatarImage src={profile.profileImage || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.username}</h1>
              <p className="text-muted-foreground">Level {profile.level}</p>
            </div>

            {isEditing && isOwnProfile ? (
              <div className="space-y-3">
                <textarea
                  placeholder="Bio"
                  value={editData.bio}
                  onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full glass bg-card/50 border-primary/20 rounded-lg p-2 text-foreground placeholder:text-muted-foreground text-sm"
                  rows={2}
                />
                <input
                  placeholder="Location"
                  value={editData.location}
                  onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full glass bg-card/50 border-primary/20 rounded-lg p-2 text-foreground placeholder:text-muted-foreground text-sm"
                />
                <input
                  placeholder="Website"
                  value={editData.website}
                  onChange={(e) => setEditData((prev) => ({ ...prev, website: e.target.value }))}
                  className="w-full glass bg-card/50 border-primary/20 rounded-lg p-2 text-foreground placeholder:text-muted-foreground text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                  >
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="text-sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.bio && <p className="text-foreground">{profile.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon size={16} />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary/20 hover:bg-primary/30 text-primary rounded-lg flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                className={`rounded-lg ${
                  isFollowing
                    ? "bg-primary/20 hover:bg-primary/30 text-primary"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-primary/10 pt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{profile.postCount}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{profile.followers.length}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{profile.following.length}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>

        {/* XP and Level */}
        <div className="bg-primary/10 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total XP</span>
            <span className="text-xl font-bold text-primary">{profile.xp}</span>
          </div>
          <div className="w-full bg-card/50 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2"
              style={{ width: `${Math.min((profile.xp / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
