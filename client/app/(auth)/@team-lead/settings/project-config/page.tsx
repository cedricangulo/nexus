// import ThemePicker from "@/components/shared/settings/theme-picker";
import ProjectConfig from "@/components/team-lead/settings/project-config";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { getProject } from "@/lib/data/project";
import { getAuthContext } from "@/lib/helpers/auth-token";

export default async function ProjectConfigPage() {
  // Auth and role validation handled by parent layout
  // Fetch data on the server
  const { token } = await getAuthContext();
  const [project, phases] = await Promise.all([
    getProject(token),
    getPhasesWithDetails(token),
  ]);

  return (
    <>
      <ProjectConfig phases={phases} project={project} />
      {/* <ThemePicker /> */}
    </>
  );
}
