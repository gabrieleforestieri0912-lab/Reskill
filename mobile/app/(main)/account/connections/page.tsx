import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import ConnectionsPage from "@/components/ConnectionsPage"

export default async function Connections() {
  const session = await auth()
  if (!session) redirect("/login")
  return <ConnectionsPage />
}
