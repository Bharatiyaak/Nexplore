import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Explore - Nexplore",
  description: "Explore trending creators and content",
}

export default function ExplorePage() {
  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Explore</h1>
        <Card className="glass-light p-8 text-center text-muted-foreground">Trending content coming soon</Card>
      </div>
    </ProtectedLayout>
  )
}
