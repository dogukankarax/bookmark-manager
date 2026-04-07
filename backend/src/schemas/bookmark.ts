import { z } from "zod";

export const createBookmarkSchema = z.object({
  title: z.string().min(1),
  url: z.url().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateBookmarkSchema = createBookmarkSchema.partial();
