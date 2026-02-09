import { z } from "zod";

export const SendBodySchema = z.object({
  phone: z.string().min(1, "נדרשים מספר טלפון ותוכן הודעה (או templateId)"),
  content: z.string().optional(),
  templateId: z.string().optional(),
});

export const SendResponseSchema = z.object({ ok: z.literal(true) });

export type SendBody = z.infer<typeof SendBodySchema>;
