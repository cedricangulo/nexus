import { describe, expect, it } from "vitest";
import { userApi } from "../user";

describe("User API", () => {
  describe("listUsers", () => {
    it("should list all users successfully", async () => {
      const users = await userApi.listUsers();
      expect(users).toHaveLength(2);
      expect(users[0].id).toBe("1");
      expect(users[0].role).toBe("MEMBER");
      expect(users[1].id).toBe("2");
      expect(users[1].role).toBe("TEAM_LEAD");
    });

    it("should return array of users with all required fields", async () => {
      const users = await userApi.listUsers();
      for (const user of users) {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("role");
        expect(user).toHaveProperty("createdAt");
        expect(user).toHaveProperty("updatedAt");
      }
    });
  });

  describe("getUserById", () => {
    it("should get user by id successfully", async () => {
      const user = await userApi.getUserById("1");
      expect(user.id).toBe("1");
      expect(user.name).toBe("Test User");
    });

    it("should return user with all required fields", async () => {
      const user = await userApi.getUserById("1");
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("role");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");
    });

    it("should handle 404 when user not found", async () => {
      try {
        await userApi.getUserById("not-found");
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it("should handle 500 server error", async () => {
      try {
        await userApi.getUserById("server-error");
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe("updateUser", () => {
    it("should update user name successfully", async () => {
      const updatedUser = await userApi.updateUser("1", {
        name: "Updated Name",
      });
      expect(updatedUser.name).toBe("Updated Name");
    });

    it("should update user role successfully", async () => {
      const updatedUser = await userApi.updateUser("1", { role: "TEAM_LEAD" });
      expect(updatedUser.role).toBe("TEAM_LEAD");
    });

    it("should update user email successfully", async () => {
      const updatedUser = await userApi.updateUser("1", {
        email: "new@example.com",
      });
      expect(updatedUser.email).toBe("new@example.com");
    });

    it("should update multiple user fields at once", async () => {
      const updatedUser = await userApi.updateUser("1", {
        name: "New Name",
        email: "new@example.com",
        role: "ADVISER",
      });
      expect(updatedUser.name).toBe("New Name");
      expect(updatedUser.email).toBe("new@example.com");
      expect(updatedUser.role).toBe("ADVISER");
    });

    it("should return updated user with all fields intact", async () => {
      const updatedUser = await userApi.updateUser("1", { name: "Updated" });
      expect(updatedUser).toHaveProperty("id");
      expect(updatedUser).toHaveProperty("email");
      expect(updatedUser).toHaveProperty("createdAt");
      expect(updatedUser).toHaveProperty("updatedAt");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      await expect(userApi.deleteUser("1")).resolves.not.toThrow();
    });

    it("should handle delete for non-existent user", async () => {
      await expect(userApi.deleteUser("999")).resolves.not.toThrow();
    });
  });

  describe("restoreUser", () => {
    it("should restore user successfully", async () => {
      const restoredUser = await userApi.restoreUser("1");
      expect(restoredUser.deletedAt).toBeNull();
    });

    it("should return restored user with updated timestamp", async () => {
      const restoredUser = await userApi.restoreUser("1");
      expect(restoredUser).toHaveProperty("id");
      expect(restoredUser).toHaveProperty("updatedAt");
    });

    it("should restore user with all fields preserved", async () => {
      const restoredUser = await userApi.restoreUser("1");
      expect(restoredUser).toHaveProperty("email");
      expect(restoredUser).toHaveProperty("name");
      expect(restoredUser).toHaveProperty("role");
      expect(restoredUser).toHaveProperty("createdAt");
    });
  });

  describe("getUserContributions", () => {
    it("should get user contributions successfully", async () => {
      const contributions = await userApi.getUserContributions("1");
      expect(contributions).toHaveProperty("assignedTasksCount");
      expect(contributions).toHaveProperty("completedTasksCount");
      expect(contributions).toHaveProperty("uploadedEvidenceCount");
      expect(contributions).toHaveProperty("commentsCount");
    });

    it("should return contribution counts with correct types", async () => {
      const contributions = await userApi.getUserContributions("1");
      expect(typeof contributions.assignedTasksCount).toBe("number");
      expect(typeof contributions.completedTasksCount).toBe("number");
      expect(typeof contributions.uploadedEvidenceCount).toBe("number");
      expect(typeof contributions.commentsCount).toBe("number");
    });

    it("should return non-negative contribution counts", async () => {
      const contributions = await userApi.getUserContributions("1");
      expect(contributions.assignedTasksCount).toBeGreaterThanOrEqual(0);
      expect(contributions.completedTasksCount).toBeGreaterThanOrEqual(0);
      expect(contributions.uploadedEvidenceCount).toBeGreaterThanOrEqual(0);
      expect(contributions.commentsCount).toBeGreaterThanOrEqual(0);
    });
  });
});
