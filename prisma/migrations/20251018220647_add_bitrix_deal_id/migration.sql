/*
  Warnings:

  - You are about to drop the column `bitrixId` on the `cotizaciones` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bitrixDealId]` on the table `cotizaciones` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."cotizaciones_bitrixId_idx";

-- DropIndex
DROP INDEX "public"."cotizaciones_bitrixId_key";

-- AlterTable
ALTER TABLE "cotizaciones" DROP COLUMN "bitrixId",
ADD COLUMN     "bitrixDealId" TEXT,
ADD COLUMN     "chubb_mm" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_bitrixDealId_key" ON "cotizaciones"("bitrixDealId");

-- CreateIndex
CREATE INDEX "cotizaciones_bitrixDealId_idx" ON "cotizaciones"("bitrixDealId");
