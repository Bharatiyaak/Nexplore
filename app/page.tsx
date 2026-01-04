import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Users, TrendingUp, Shield } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-foreground text-balance">
              Welcome to <span className="text-primary">Nexplore</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
              The platform for creators to discover talent, build communities, and grow together
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-lg glow-primary">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="px-8 py-6 text-lg rounded-lg border-primary/30 text-foreground hover:bg-primary/10 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16">Platform Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-light p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Sparkles className="text-primary" size={24} />
              </div>
              <h3 className="font-bold text-foreground">Create & Share</h3>
              <p className="text-muted-foreground text-sm">Share your work, ideas, and creativity with the world</p>
            </Card>

            <Card className="glass-light p-6 space-y-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Users className="text-secondary" size={24} />
              </div>
              <h3 className="font-bold text-foreground">Build Community</h3>
              <p className="text-muted-foreground text-sm">Follow creators, engage with content, and grow together</p>
            </Card>

            <Card className="glass-light p-6 space-y-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-accent" size={24} />
              </div>
              <h3 className="font-bold text-foreground">Earn Rewards</h3>
              <p className="text-muted-foreground text-sm">Gain XP, unlock badges, and level up as a creator</p>
            </Card>

            <Card className="glass-light p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="font-bold text-foreground">Safe & Secure</h3>
              <p className="text-muted-foreground text-sm">Your data is protected with Firebase security</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="glass-light p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Ready to start your creator journey?</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of creators building their presence on Nexplore
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg glow-primary">
                  Create Your Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="px-8 py-3 rounded-lg bg-transparent">
                  Already a member? Sign in
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
