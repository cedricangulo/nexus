import { beforeEach, describe, expect, it } from "vitest";
import { projectApi } from "@/lib/api/project";
import { sprintApi } from "@/lib/api/sprint";
import { clearAuth, loginAsAdmin } from "./helpers";

describe("Sprint Integration Tests", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should perform CRUD operations on sprints", async () => {
    try {
      await loginAsAdmin();

      // Prerequisite: Get Project
      let project;
      try {
        project = await projectApi.getProject();
      } catch (e: any) {
        if (e.response && e.response.status === 404) {
          project = await projectApi.createProject({
            name: `Sprint Test Project ${Date.now()}`,
            startDate: new Date().toISOString(),
          });
        } else {
          throw e;
        }
      }

      // 1. Create Sprint
      const newSprint = {
        projectId: project.id,
        goal: `Integration Test Sprint ${Date.now()}`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks later
      };

      const createdSprint = await sprintApi.createSprint(newSprint);
      expect(createdSprint).toBeDefined();
      expect(createdSprint.goal).toBe(newSprint.goal);
      expect(createdSprint.id).toBeDefined();

      // 2. Get Sprint
      const sprint = await sprintApi.getSprintById(createdSprint.id);
      expect(sprint).toBeDefined();
      expect(sprint.id).toBe(createdSprint.id);

      // 3. Update Sprint
      const updateData = {
        goal: `Updated Sprint Goal ${Date.now()}`,
      };
      const updatedSprint = await sprintApi.updateSprint(
        createdSprint.id,
        updateData
      );
      expect(updatedSprint.goal).toBe(updateData.goal);

      // 4. List Sprints
      const sprints = await sprintApi.listSprints();
      expect(sprints.length).toBeGreaterThan(0);
      const found = sprints.find((s) => s.id === createdSprint.id);
      expect(found).toBeDefined();

      // 5. Delete Sprint
      await sprintApi.deleteSprint(createdSprint.id);

      // Verify Deletion
      try {
        await sprintApi.getSprintById(createdSprint.id);
        throw new Error("Sprint should have been deleted");
      } catch (error: any) {
        if (error.message === "Sprint should have been deleted") {
          throw error;
        }
        expect(error.response?.status).toBe(404);
      }
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      throw error;
    }
  });
});
