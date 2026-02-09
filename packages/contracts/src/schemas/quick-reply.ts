import { z } from "zod";

export const QuickReplySchema = z.object({
  id: z.string(),
  shortcut: z.string(),
  content: z.string(),
});

export const CreateQuickReplyBodySchema = z.object({
  shortcut: z.string().min(1, "נדרשים shortcut ותוכן"),
  content: z.string().min(1, "נדרשים shortcut ותוכן"),
});

export type QuickReply = z.infer<typeof QuickReplySchema>;
export type CreateQuickReplyBody = z.infer<typeof CreateQuickReplyBodySchema>;
