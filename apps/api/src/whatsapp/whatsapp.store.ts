export type ConnectionStatus = 'disconnected' | 'connecting' | 'ready';

let connectionStatus: ConnectionStatus = 'disconnected';
let qrDataUrl: string | null = null;

export function getConnectionStatus(): ConnectionStatus {
  return connectionStatus;
}

export function setConnectionStatus(status: ConnectionStatus): void {
  connectionStatus = status;
  // Clear QR only when connected (ready) or on auth_failure; keep it on disconnected so user can scan
  if (status === 'ready') {
    qrDataUrl = null;
  }
}

export function getQrDataUrl(): string | null {
  return qrDataUrl;
}

export function setQrDataUrl(url: string | null): void {
  qrDataUrl = url;
}
