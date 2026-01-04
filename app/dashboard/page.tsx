import { UserHeader } from "@/components/dashboard/user-header"
import { Feed } from "@/components/posts/feed"

export const metadata = {
  title: "Dashboard - Nexplore",
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <UserHeader />
      <Feed />
    </div>
  )
}
