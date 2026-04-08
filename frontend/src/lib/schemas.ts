import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createBookmarkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type CreateBookmarkForm = z.infer<typeof createBookmarkSchema>;
