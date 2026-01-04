"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CommentsSection } from "./comments-section"
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, ChevronUp } from "lucide-react"
import Link from "next/link"

interface PostCardProps {
  id: string
  authorId: string
  authorName: string
  authorImage?: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
  createdAt: Date
  liked?: boolean
  onLike?: (postId: string) => void
  onDelete?: (postId: string) => void
}

export function PostCard({
  id,
  authorId,
  authorName,
  authorImage,
  content,
  imageUrl,
  likes,
  comments,
  createdAt,
  liked = false,
  onLike,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentLikes, setCurrentLikes] = useState(likes)
  const [isLiked, setIsLiked] = useState(liked)
  const [showComments, setShowComments] = useState(false)

  const isAuthor = user?.uid === authorId

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const postRef = doc(db, "posts", id)
      const postDoc = await getDoc(postRef)
      const currentData = postDoc.data()
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1
      const likedBy = currentData?.likedBy || []
      const updatedLikedBy = isLiked ? likedBy.filter((uid: string) => uid !== user?.uid) : [...likedBy, user?.uid]

      await updateDoc(postRef, {
        likes: newLikes,
        likedBy: updatedLikedBy,
      })
      setCurrentLikes(newLikes)
      setIsLiked(!isLiked)
      onLike?.(id)
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "posts", id))
      onDelete?.(id)
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Card className="glass-light p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link href={`/profile/${authorId}`} className="flex items-center gap-3 flex-1 hover:opacity-80">
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarImage src={authorImage || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary/20 text-primary">{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{authorName}</h3>
            <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
          </div>
        </Link>

        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <MoreVertical size={18} className="text-muted-foreground" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 glass-light rounded-lg p-2 z-10">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-destructive/20 text-destructive rounded transition-colors text-sm w-full"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-foreground leading-relaxed">{content}</p>

      {/* Image */}
      {imageUrl && (
        <img src={imageUrl || "/placeholder.svg"} alt="Post" className="w-full rounded-lg max-h-96 object-cover" />
      )}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground border-t border-primary/10 pt-4">
        <span>{currentLikes} likes</span>
        <span>{comments} comments</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
            isLiked ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:bg-primary/10 hover:text-foreground rounded-lg transition-all"
        >
          <MessageCircle size={18} />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-muted-foreground hover:bg-primary/10 hover:text-foreground rounded-lg transition-all">
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-primary/10 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Comments</h4>
            <button onClick={() => setShowComments(false)} className="text-muted-foreground hover:text-foreground">
              <ChevronUp size={18} />
            </button>
          </div>
          <CommentsSection postId={id} postAuthorId={authorId} />
        </div>
      )}
    </Card>
  )
}
