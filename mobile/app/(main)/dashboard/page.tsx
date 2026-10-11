import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import DashboardWorkspace from "@/components/DashboardWorkspace";

export default async function DashboardPage() {
 const session = await auth();

 // Redirect to login if user is not authenticated
 if (!session) {
 redirect("/login");
 }

 return <DashboardWorkspace />;
}
