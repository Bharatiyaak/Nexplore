"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"
import { Users, Zap, AlertCircle, BarChart3, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

const ADMIN_UID = "admin123" // Change this to your admin UID

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!user || user.uid !== ADMIN_UID) {
      router.push("/dashboard")
      return
    }

    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"))
        const postsSnapshot = await getDocs(collection(db, "posts"))
        const commentsSnapshot = await getDocs(collection(db, "comments"))

        setUsers(
          usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        )

        setStats({
          totalUsers: usersSnapshot.size,
          totalPosts: postsSnapshot.size,
          totalComments: commentsSnapshot.size,
          activeToday: usersSnapshot.docs.filter((doc) => {
            const lastActive = doc.data().lastActive
            if (!lastActive) return false
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return lastActive.toDate() > dayAgo
          }).length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, router])

  if (user?.uid !== ADMIN_UID) {
    return null
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="max-w-6xl mx-auto animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 glass rounded-lg" />
          ))}
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-light p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Users className="text-primary" size={20} />
              <span className="text-2xl font-bold text-primary">{stats?.totalUsers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </Card>

          <Card className="glass-light p-6 space-y-2">
            <div className="flex items-center justify-between">
              <Zap className="text-secondary" size={20} />
              <span className="text-2xl font-bold text-secondary">{stats?.totalPosts || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </Card>

          <Card className="glass-light p-6 space-y-2">
            <div className="flex items-center justify-between">
              <AlertCircle className="text-accent" size={20} />
              <span className="text-2xl font-bold text-accent">{stats?.totalComments || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Comments</p>
          </Card>

          <Card className="glass-light p-6 space-y-2">
            <div className="flex items-center justify-between">
              <BarChart3 className="text-primary" size={20} />
              <span className="text-2xl font-bold text-primary">{stats?.activeToday || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="glass-light p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 px-4 text-muted-foreground">Username</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Level</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Followers</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="py-3 px-4 text-foreground">{userItem.username}</td>
                    <td className="py-3 px-4 text-muted-foreground">{userItem.email}</td>
                    <td className="py-3 px-4 text-foreground">{userItem.level || 1}</td>
                    <td className="py-3 px-4 text-foreground">{userItem.followers?.length || 0}</td>
                    <td className="py-3 px-4">
                      <button className="text-destructive hover:bg-destructive/20 p-2 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
