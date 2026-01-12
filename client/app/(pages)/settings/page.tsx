import { forbidden, redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();

  if (session?.user?.role === "member" || session?.user?.role === "adviser") {
    forbidden();
  }
  // Auth and role validation handled by parent layout
  redirect("/settings/project-config");
}
