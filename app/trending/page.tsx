import { ProtectedLayout } from "@/components/navigation/protected-layout"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Trending - Nexplore",
  description: "Trending on Nexplore",
}

export default function TrendingPage() {
  return (
    <ProtectedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Trending</h1>
        <Card className="glass-light p-8 text-center text-muted-foreground">Trending posts coming soon</Card>
      </div>
    </ProtectedLayout>
  )
}
