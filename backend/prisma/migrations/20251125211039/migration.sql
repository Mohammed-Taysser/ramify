/*
  Warnings:

  - You are about to alter the column `startingValue` on the `Discussion` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,10)`.
  - You are about to alter the column `value` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,10)`.
  - You are about to alter the column `beforeValue` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,10)`.
  - You are about to alter the column `afterValue` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,10)`.

*/
-- AlterTable
ALTER TABLE "Discussion" ALTER COLUMN "startingValue" SET DATA TYPE DECIMAL(20,10);

-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "depth" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "value" SET DATA TYPE DECIMAL(20,10),
ALTER COLUMN "beforeValue" SET DATA TYPE DECIMAL(20,10),
ALTER COLUMN "afterValue" SET DATA TYPE DECIMAL(20,10);
