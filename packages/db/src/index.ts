import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function findMonorepoRoot(startDir: string): string | null {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    const prismaDir = path.join(dir, "prisma");
    if (fs.existsSync(prismaDir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function resolveDatabaseUrl(): string {
  let url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (url.startsWith("file:") && url.includes("\\")) {
    url = url.replace(/\\/g, "/");
  }
  const pathPart = url.replace(/^file:\/*/, "");
  const isRelative = pathPart.startsWith(".") || (!path.isAbsolute(pathPart) && !pathPart.includes(":"));
  if (!isRelative) return url;
  const cwd = process.cwd();
  const absPath = path.resolve(cwd, pathPart);
  const dir = path.dirname(absPath);
  if (fs.existsSync(dir)) return url;
  const root = findMonorepoRoot(cwd) ?? findMonorepoRoot(__dirname);
  if (root) {
    const dbPath = path.join(root, "prisma", "dev.db");
    const prismaDir = path.dirname(dbPath);
    if (!fs.existsSync(prismaDir)) fs.mkdirSync(prismaDir, { recursive: true });
    return `file:${dbPath.replace(/\\/g, "/")}`;
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  const url = resolveDatabaseUrl();
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { PrismaClient };
