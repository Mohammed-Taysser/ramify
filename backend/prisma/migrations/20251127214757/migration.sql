/*
  Warnings:

  - You are about to alter the column `startingValue` on the `Discussion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,10)` to `DoublePrecision`.
  - You are about to alter the column `value` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,10)` to `DoublePrecision`.
  - You are about to alter the column `beforeValue` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,10)` to `DoublePrecision`.
  - You are about to alter the column `afterValue` on the `Operation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,10)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Discussion" ALTER COLUMN "startingValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "beforeValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "afterValue" SET DATA TYPE DOUBLE PRECISION;
