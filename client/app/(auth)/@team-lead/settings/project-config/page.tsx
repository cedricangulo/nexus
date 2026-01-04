// import ThemePicker from "@/components/shared/settings/theme-picker";
import ProjectConfig from "@/components/team-lead/settings/project-config";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { getProject } from "@/lib/data/project";

export default async function ProjectConfigPage() {
  // Auth and role validation handled by parent layout
  // Fetch data on the server
  const [project, phases] = await Promise.all([
    getProject(),
    getPhasesWithDetails(),
  ]);

  return (
    <>
      <ProjectConfig phases={phases} project={project} />
      {/* <ThemePicker /> */}
    </>
  );
}
