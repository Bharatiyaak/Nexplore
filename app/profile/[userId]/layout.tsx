import type React from "react"
import { ProtectedLayout } from "@/components/navigation/protected-layout"

export const metadata = {
  title: "Profile - Nexplore",
  description: "Creator profile",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
