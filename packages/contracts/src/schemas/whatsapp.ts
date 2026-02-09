import { z } from "zod";

export const ConnectionStatusSchema = z.enum([
  "disconnected",
  "connecting",
  "ready",
]);

export const WhatsAppStatusResponseSchema = z.object({
  status: ConnectionStatusSchema,
  qr: z.string().optional(),
});

export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export type WhatsAppStatusResponse = z.infer<typeof WhatsAppStatusResponseSchema>;
