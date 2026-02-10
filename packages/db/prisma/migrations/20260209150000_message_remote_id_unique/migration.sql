-- Remove duplicate messages: keep one per remoteId (smallest id)
DELETE FROM "Message" WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY "remoteId" ORDER BY id) AS rn
    FROM "Message"
  ) WHERE rn > 1
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Message_remoteId_key" ON "Message"("remoteId");
