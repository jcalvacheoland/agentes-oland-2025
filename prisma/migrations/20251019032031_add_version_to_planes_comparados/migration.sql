-- AlterTable
ALTER TABLE "planes_comparados" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "planes_comparados_version_idx" ON "planes_comparados"("version");
