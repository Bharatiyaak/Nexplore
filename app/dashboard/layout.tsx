import type React from "react"
import { ProtectedLayout } from "@/components/navigation/protected-layout"

export const metadata = {
  title: "Dashboard - Nexplore",
  description: "Your Nexplore creator dashboard",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
