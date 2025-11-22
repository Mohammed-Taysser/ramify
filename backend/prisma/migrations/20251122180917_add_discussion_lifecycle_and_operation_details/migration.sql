/*
  Warnings:

  - You are about to drop the column `totals` on the `Operation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Discussion" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "isEnded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Operation" DROP COLUMN "totals",
ADD COLUMN     "afterValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "beforeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT;
