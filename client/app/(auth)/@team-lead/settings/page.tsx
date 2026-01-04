import { redirect } from "next/navigation";

export default async function SettingsPage() {
  // Auth and role validation handled by parent layout
  redirect("/settings/project-config");
}
