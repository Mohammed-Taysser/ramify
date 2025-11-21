/*
  Warnings:

  - Added the required column `startingNumber` to the `Discussion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Discussion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startingNumber" REAL NOT NULL,
    CONSTRAINT "Discussion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Discussion" ("createdAt", "createdBy", "id", "title", "updatedAt") SELECT "createdAt", "createdBy", "id", "title", "updatedAt" FROM "Discussion";
DROP TABLE "Discussion";
ALTER TABLE "new_Discussion" RENAME TO "Discussion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
