"use client"

import React from "react"

import type { ReactElement } from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { collection, addDoc, doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ImageIcon, X } from "lucide-react"

interface CreatePostProps {
  onPostCreated?: () => void
}

export function CreatePost({ onPostCreated }: CreatePostProps): ReactElement {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userProfile, setUserProfile] = useState<any>(null)

  // Fetch user profile
  React.useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setUserProfile(docSnap.data())
      }
    }
    fetchProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user || !userProfile) {
      setError("Content is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: userProfile.username || user.displayName,
        authorImage: userProfile.profileImage || "",
        content,
        imageUrl: imageUrl || null,
        likes: 0,
        comments: 0,
        likedBy: [],
        createdAt: Timestamp.now(),
      })

      setContent("")
      setImageUrl("")
      onPostCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile) {
    return <Card className="glass-light p-6 h-32 animate-pulse" />
  }

  return (
    <Card className="glass-light p-6 space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 flex-shrink-0 border border-primary/20">
          <AvatarImage src={userProfile.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {userProfile.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <textarea
            placeholder="Share your thoughts, work, or ideas..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full glass bg-card/50 border-primary/20 rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={4}
          />

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/30 p-2 rounded">
              {error}
            </div>
          )}

          {imageUrl && (
            <div className="relative inline-block">
              <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="max-h-40 rounded-lg" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const url = prompt("Enter image URL:")
                if (url) setImageUrl(url)
              }}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <ImageIcon size={18} />
            </button>

            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 glow-primary"
            >
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
