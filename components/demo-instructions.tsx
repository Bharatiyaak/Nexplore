import { Card } from "@/components/ui/card"
import { AlertCircle, BookOpen } from "lucide-react"

export function DemoInstructions() {
  return (
    <Card className="glass-light p-6 space-y-4 border-primary/20">
      <div className="flex items-start gap-3">
        <BookOpen className="text-primary flex-shrink-0 mt-1" size={20} />
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Getting Started with Nexplore</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Create an account and explore your creator dashboard</li>
            <li>Write posts to share your work and ideas</li>
            <li>Like and comment on other creators' posts</li>
            <li>Follow creators to see their latest content</li>
            <li>Earn XP and unlock badges through engagement</li>
            <li>Access your Creator Space to see analytics</li>
          </ul>

          <div className="bg-primary/10 rounded p-3 mt-4">
            <div className="flex gap-2 text-sm">
              <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-primary">
                To test all features, create multiple accounts and follow each other to see the full social experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
