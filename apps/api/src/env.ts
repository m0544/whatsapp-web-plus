/**
 * Must run before any code that imports @whatsapp-web-plus/db (Prisma).
 * Sets DATABASE_URL so the DB path is correct when API runs from apps/api or apps/api/dist.
 */
import path from 'path';
import fs from 'fs';
import { config } from 'dotenv';

const rootDir = path.resolve(__dirname, '..', '..', '..');
config({ path: path.join(rootDir, '.env') });
config();

const prismaDir = path.join(rootDir, 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}
const dbPath = path.join(prismaDir, 'dev.db');
process.env.DATABASE_URL =
  process.env.DATABASE_URL || `file:${dbPath.replace(/\\/g, '/')}`;
