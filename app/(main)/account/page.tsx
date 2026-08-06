import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import AccountPage from "@/components/AccountPage"

export default async function Account() {
  const session = await auth()
  if (!session) redirect("/login")
  return <AccountPage />
}
