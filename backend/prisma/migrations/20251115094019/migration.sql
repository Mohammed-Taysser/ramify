/*
  Warnings:

  - You are about to drop the column `operation` on the `Operation` table. All the data in the column will be lost.
  - Added the required column `operationType` to the `Operation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Operation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discussionId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "operationType" TEXT NOT NULL,
    "totals" REAL NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" INTEGER NOT NULL,
    CONSTRAINT "Operation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Operation_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Operation" ("createdAt", "createdBy", "discussionId", "id", "parentId", "totals", "updatedAt", "value") SELECT "createdAt", "createdBy", "discussionId", "id", "parentId", "totals", "updatedAt", "value" FROM "Operation";
DROP TABLE "Operation";
ALTER TABLE "new_Operation" RENAME TO "Operation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
