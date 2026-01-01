import { z } from "zod";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]);

export const createSprintTaskSchema = z.object({
  sprintId: z.uuid(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  assigneeIds: z.array(z.uuid()).optional(),
});

export const createPhaseTaskSchema = z.object({
  phaseId: z.uuid(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  status: taskStatusSchema,
  assigneeIds: z.array(z.uuid()).optional(),
});

export const updateTaskStatusSchema = z
  .object({
    sprintId: z.uuid(),
    taskId: z.uuid(),
    status: taskStatusSchema,
    comment: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.status !== "BLOCKED") {
        return true;
      }
      return Boolean(data.comment);
    },
    {
      message: "Reason is required when status is Blocked",
      path: ["comment"],
    }
  );

export const updateTaskSchema = z.object({
  sprintId: z.uuid(),
  taskId: z.uuid(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  assigneeIds: z.array(z.uuid()).optional(),
});

export const updatePhaseTaskSchema = z.object({
  phaseId: z.uuid(),
  taskId: z.uuid(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  status: taskStatusSchema,
  assigneeIds: z.array(z.uuid()).optional(),
});

export const taskDetailSchema = z
  .object({
    taskId: z.uuid(),
    sprintId: z.uuid(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional().or(z.literal("")),
    status: taskStatusSchema,
    assigneeIds: z.array(z.uuid()).optional(),
    blockReason: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.status !== "BLOCKED") {
        return true;
      }
      return Boolean(data.blockReason);
    },
    {
      message: "Reason is required when status is Blocked",
      path: ["blockReason"],
    }
  );

export type CreateSprintTaskInput = z.infer<typeof createSprintTaskSchema>;
export type CreatePhaseTaskInput = z.infer<typeof createPhaseTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdatePhaseTaskInput = z.infer<typeof updatePhaseTaskSchema>;
export type TaskDetailInput = z.infer<typeof taskDetailSchema>;
