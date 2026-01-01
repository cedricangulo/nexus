import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().describe('User\'s email address for login'),
  password: z.string().min(6).describe('User\'s password'),
}).describe('Schema for user login request');

export const loginResponseSchema = z.object({
  token: z.string().describe('JWT authentication token'),
  user: z.object({
    id: z.uuid().describe('Unique identifier of the user'),
    email: z.string().email().describe('User\'s email address'),
    name: z.string().describe('User\'s full name'),
    role: z.enum(['MEMBER', 'TEAM_LEAD', 'ADVISER']).describe('Role of the user'),
  }).describe('Authenticated user details'),
}).describe('Response object for successful user login');

export const inviteUserSchema = z.object({
  email: z.string().email().describe('Email address of the user to invite'),
  name: z.string().min(2).describe('Full name of the user to invite'),
  role: z.enum(['MEMBER', 'TEAM_LEAD', 'ADVISER']).default('MEMBER').describe('Role to assign to the new user'),
}).describe('Schema for inviting a new user');

export const inviteUserResponseSchema = z.object({
  id: z.uuid().describe('User ID'),
  email: z.string().email().describe('User email address'),
  name: z.string().describe('User full name'),
  role: z.enum(['MEMBER', 'TEAM_LEAD', 'ADVISER']).describe('User role'),
}).describe('Response object for successful user invitation');

export const changePasswordSchema = z.object({
  currentPassword: z.string().describe('User\'s current password'),
  newPassword: z.string().min(6).describe('User\'s new password'),
}).describe('Schema for changing user password');

export type LoginInput = z.infer<typeof loginSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
