"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PostCard } from "./post-card"
import { CreatePost } from "./create-post"

interface Post {
  id: string
  authorId: string
  authorName: string
  authorImage?: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
  createdAt: Timestamp
  likedBy: string[]
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[]
        setPosts(postsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching posts:", error)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <CreatePost onPostCreated={() => {}} />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 glass-light rounded-lg animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            authorId={post.authorId}
            authorName={post.authorName}
            authorImage={post.authorImage}
            content={post.content}
            imageUrl={post.imageUrl}
            likes={post.likes}
            comments={post.comments}
            createdAt={post.createdAt.toDate()}
            onDelete={() => {}}
          />
        ))
      )}
    </div>
  )
}
