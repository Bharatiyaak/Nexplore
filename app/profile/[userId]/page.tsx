import { ProfileHeader } from "@/components/profile/profile-header"
import { UserPosts } from "@/components/profile/user-posts"

interface ProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { userId } = await params
  return {
    title: `Profile - Nexplore`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ProfileHeader userId={userId} />
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Posts</h2>
        <UserPosts userId={userId} />
      </div>
    </div>
  )
}
