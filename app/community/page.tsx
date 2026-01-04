import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Community - Nexplore",
  description: "Connect with creators",
}

export default function CommunityPage() {
  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Community</h1>
        <Card className="glass-light p-8 text-center text-muted-foreground">Community features coming soon</Card>
      </div>
    </ProtectedLayout>
  )
}
