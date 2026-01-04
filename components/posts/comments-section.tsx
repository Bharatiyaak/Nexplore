"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Trash2, Send } from "lucide-react"

interface Comment {
  id: string
  authorId: string
  authorName: string
  authorImage?: string
  content: string
  createdAt: Timestamp
}

interface CommentsSectionProps {
  postId: string
  postAuthorId: string
}

export function CommentsSection({ postId, postAuthorId }: CommentsSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Fetch user profile
  useEffect(() => {
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

  // Listen to comments
  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
      setComments(commentsData)
      setLoading(false)
    })

    return unsubscribe
  }, [postId])

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user || !userProfile) return

    setPosting(true)
    try {
      await addDoc(collection(db, "comments"), {
        postId,
        authorId: user.uid,
        authorName: userProfile.username || user.displayName,
        authorImage: userProfile.profileImage || "",
        content: commentText,
        createdAt: Timestamp.now(),
      })
      setCommentText("")
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "comments", commentId))
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const formatDate = (date: Timestamp) => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.toDate().getTime()) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handlePostComment} className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0 border border-primary/20">
          <AvatarImage src={userProfile?.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {userProfile?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="glass bg-card/50 border-primary/20 text-foreground placeholder:text-muted-foreground"
            disabled={!userProfile}
          />
          <Button
            type="submit"
            disabled={!commentText.trim() || posting || !userProfile}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-2"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 glass rounded-lg animate-pulse" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="glass-light p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 border border-primary/20">
                    <AvatarImage src={comment.authorImage || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {comment.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                {user?.uid === comment.authorId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive/60 hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground ml-9">{comment.content}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
