import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import FeedPage from "@/components/FeedPage"

export default async function Feed() {
  const session = await auth()
  if (!session) redirect("/login")
  return <FeedPage />
}
