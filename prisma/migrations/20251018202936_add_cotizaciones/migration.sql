-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bitrixId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "submodelEqui" INTEGER NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vehicleValue" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "extras" INTEGER NOT NULL DEFAULT 0,
    "newVehicle" INTEGER NOT NULL DEFAULT 0,
    "useOfVehicle" TEXT,
    "city" TEXT,
    "identification" TEXT,
    "name" TEXT,
    "firstLastName" TEXT,
    "secondLastName" TEXT,
    "gender" TEXT,
    "civilStatus" TEXT,
    "birthdate" TEXT,
    "age" TEXT,
    "cityCodeMapfre" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_bitrixId_key" ON "cotizaciones"("bitrixId");

-- CreateIndex
CREATE INDEX "cotizaciones_userId_idx" ON "cotizaciones"("userId");

-- CreateIndex
CREATE INDEX "cotizaciones_bitrixId_idx" ON "cotizaciones"("bitrixId");

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
