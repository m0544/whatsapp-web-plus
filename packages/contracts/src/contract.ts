import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  QuickReplySchema,
  CreateQuickReplyBodySchema,
} from "./schemas/quick-reply";
import { SendBodySchema, SendResponseSchema } from "./schemas/send";
import { WhatsAppStatusResponseSchema } from "./schemas/whatsapp";

const c = initContract();

const errorResponseSchema = z.object({ error: z.string() });

export const apiContract = c.router({
  quickReplies: {
    list: {
      method: "GET",
      path: "/quick-replies",
      responses: {
        200: z.array(QuickReplySchema),
        500: errorResponseSchema,
      },
    },
    create: {
      method: "POST",
      path: "/quick-replies",
      body: CreateQuickReplyBodySchema,
      responses: {
        201: QuickReplySchema,
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    delete: {
      method: "DELETE",
      path: "/quick-replies/:id",
      pathParams: z.object({ id: z.string() }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        500: errorResponseSchema,
      },
    },
  },
  send: {
    post: {
      method: "POST",
      path: "/send",
      body: SendBodySchema,
      responses: {
        200: SendResponseSchema,
        400: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  },
  whatsapp: {
    status: {
      method: "GET",
      path: "/whatsapp/status",
      responses: {
        200: WhatsAppStatusResponseSchema,
      },
    },
  },
});

export type ApiContract = typeof apiContract;
