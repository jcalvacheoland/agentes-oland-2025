-- CreateTable
CREATE TABLE "planes_comparados" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "aseguradora" TEXT NOT NULL,
    "nombrePlan" TEXT NOT NULL,
    "primaTotal" DOUBLE PRECISION NOT NULL,
    "deducible" TEXT,
    "cobertura" TEXT,
    "beneficios" TEXT,
    "pdfUrl" TEXT,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_comparados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "planes_comparados_cotizacionId_idx" ON "planes_comparados"("cotizacionId");

-- AddForeignKey
ALTER TABLE "planes_comparados" ADD CONSTRAINT "planes_comparados_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
