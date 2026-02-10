-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remoteId" TEXT NOT NULL,
    "name" TEXT,
    "profilePicturePath" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_remoteId_key" ON "Contact"("remoteId");

-- CreateTable (new ScheduledMessage with contactId)
CREATE TABLE "ScheduledMessage_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduledMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate: create Contact from distinct chatIds (id = cuid-like from remoteId hash)
INSERT INTO "Contact" ("id", "remoteId", "name", "updatedAt")
SELECT 'c' || hex(randomblob(12)), "chatId", "chatId", datetime('now')
FROM (SELECT DISTINCT "chatId" FROM "ScheduledMessage");

INSERT INTO "ScheduledMessage_new" ("id", "content", "scheduledAt", "contactId", "status", "createdAt")
SELECT sm."id", sm."content", sm."scheduledAt", c."id", sm."status", sm."createdAt"
FROM "ScheduledMessage" sm
JOIN "Contact" c ON c."remoteId" = sm."chatId";

DROP TABLE "ScheduledMessage";
ALTER TABLE "ScheduledMessage_new" RENAME TO "ScheduledMessage";
