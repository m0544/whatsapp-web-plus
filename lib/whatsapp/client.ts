import path from "path";

// Types for whatsapp-web.js (loaded dynamically in Node only)
type ClientInstance = Awaited<ReturnType<typeof getClientInternal>>;

let clientPromise: Promise<ClientInstance> | null = null;

export async function getClient(): Promise<ClientInstance> {
  if (!clientPromise) {
    clientPromise = getClientInternal();
  }
  return clientPromise;
}

async function getClientInternal() {
  const { Client, LocalAuth } = await import("whatsapp-web.js");
  const QRCode = await import("qrcode");
  const { setConnectionStatus, setQrDataUrl } = await import("./store");

  const authPath = path.join(process.cwd(), ".wwebjs_auth");
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", async (qr: string) => {
    setConnectionStatus("connecting");
    try {
      const dataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl(null);
    }
  });

  client.on("ready", () => {
    setConnectionStatus("ready");
    setQrDataUrl(null);
  });

  client.on("authenticated", () => {
    setConnectionStatus("connecting");
  });

  client.on("auth_failure", () => {
    setConnectionStatus("disconnected");
    setQrDataUrl(null);
  });

  client.on("disconnected", () => {
    setConnectionStatus("disconnected");
    setQrDataUrl(null);
  });

  return client;
}

export async function initClient(): Promise<void> {
  const { getConnectionStatus, setConnectionStatus } = await import("./store");
  if (getConnectionStatus() === "ready") return;
  const client = await getClient();
  if (getConnectionStatus() === "ready") return;
  setConnectionStatus("connecting");
  await client.initialize();
}

/**
 * Sends a text message to a WhatsApp number.
 * @param phone - Number with country code, e.g. "972501234567" (no + or spaces)
 * @param content - Message text
 */
export async function sendMessage(
  phone: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const { getConnectionStatus } = await import("./store");
  if (getConnectionStatus() !== "ready") {
    return { success: false, error: "WhatsApp לא מחובר" };
  }
  try {
    const client = await getClient();
    const normalized = phone.replace(/\D/g, "");
    if (!normalized) {
      return { success: false, error: "מספר לא תקין" };
    }
    const chatId = normalized.includes("@c.us")
      ? normalized
      : `${normalized}@c.us`;
    await client.sendMessage(chatId, content);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "שגיאה בשליחה";
    return { success: false, error: message };
  }
}
