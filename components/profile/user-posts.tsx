"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PostCard } from "@/components/posts/post-card"

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

interface UserPostsProps {
  userId: string
}

export function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "posts"), where("authorId", "==", userId), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[]
      setPosts(postsData)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 glass rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No posts yet</p>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
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
        />
      ))}
    </div>
  )
}
