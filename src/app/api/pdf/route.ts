// app/api/pdf/route.ts
import { buildPDFBuffer } from "@/lib/pdfkit";
import { BlobServiceClient } from "@azure/storage-blob";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1️⃣ Generar el PDF (tu función existente)
    const buffer = await buildPDFBuffer(body);

    // 2️⃣ Subir a Azure Blob Storage
    const fileName = `planes_AgentesOland${body.cotizacion?.id || Date.now()}_${Date.now()}.pdf`;
    const azureUrl = await uploadToAzure(buffer, fileName);

    // 3️⃣ Retornar PDF + URL de Azure en headers custom
    return new Response(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Azure-Pdf-Url": azureUrl, // 👈 URL de Azure en header custom
      },
    });
  } catch (error) {
    console.error("❌ Error en /api/pdf:", error);
    return new Response("Error generando PDF", { status: 500 });
  }
}

// 🔧 Función helper: Subir a Azure
async function uploadToAzure(buffer: Buffer, fileName: string): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "pdf";

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Crear contenedor si no existe
  await containerClient.createIfNotExists({ access: "blob" });

  // Subir el archivo
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });

  console.log("✅ PDF Agentes subido a Azure:", blockBlobClient.url);

  return blockBlobClient.url;
}