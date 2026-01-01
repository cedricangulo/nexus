import { beforeEach, describe, expect, it } from "vitest";
import { projectApi } from "@/lib/api/project";
import { sprintApi } from "@/lib/api/sprint";
import { taskApi } from "@/lib/api/task";
import { TaskStatus } from "@/lib/types";
import { clearAuth, loginAsAdmin } from "./helpers";

describe("Task Integration Tests", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("should perform CRUD operations on tasks", async () => {
    try {
      const auth = await loginAsAdmin();
      const userId = auth.user.id;

      // Prerequisite: Get or Create a project
      let project;
      try {
        project = await projectApi.getProject();
      } catch (e: any) {
        if (e.response && e.response.status === 404) {
          project = await projectApi.createProject({
            name: `Task Test Project ${Date.now()}`,
            startDate: new Date().toISOString(),
          });
        } else {
          throw e;
        }
      }

      // Prerequisite: Create a sprint
      const sprint = await sprintApi.createSprint({
        projectId: project.id,
        goal: "Integration Test Sprint",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // 1. Create Task
      const newTask = {
        title: `Integration Task ${Date.now()}`,
        description: "Task created during integration test",
        status: TaskStatus.TODO,
        sprintId: sprint.id,
        assigneeId: userId, // Assign to self
      };

      const createdTask = await taskApi.createTask(newTask);
      expect(createdTask).toBeDefined();
      expect(createdTask.title).toBe(newTask.title);
      expect(createdTask.sprintId).toBe(sprint.id);

      // 2. Get Task
      const fetchedTask = await taskApi.getTaskById(createdTask.id);
      expect(fetchedTask.id).toBe(createdTask.id);

      // 3. Update Task Status
      const updatedTask = await taskApi.updateTask(createdTask.id, {
        status: TaskStatus.IN_PROGRESS,
      });
      expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);

      // 4. List Tasks (Sprint tasks)
      const sprintTasks = await taskApi.listTasks({ sprintId: sprint.id });
      expect(sprintTasks.length).toBeGreaterThan(0);
      expect(sprintTasks.find((t) => t.id === createdTask.id)).toBeDefined();
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.warn("Skipping test: Backend server is not running");
        return;
      }
      throw error;
    }
  });
});
