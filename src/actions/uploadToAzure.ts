// actions/upload-to-azure.ts
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
//no se usa
"use server"
import { BlobServiceClient } from "@azure/storage-blob"
import { cookies } from "next/headers"

interface UploadPdfToAzureResponse {
  ok: boolean
  message: string
  url?: string
}

/**
 * Sube un PDF (Buffer) a Azure Blob Storage y retorna la URL pública
 */
export async function uploadPdfToAzure(
  pdfBuffer: Buffer,
  fileName: string
): Promise<UploadPdfToAzureResponse> {
  try {
    await cookies() // Para Next.js 15+

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "pdfs"

    // Crear cliente de Blob Service
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName)

    // Crear el contenedor si no existe
    await containerClient.createIfNotExists({
      access: "blob", // 'blob' = público, 'container' = muy público, 'private' = privado
    })

    // Generar nombre único para el blob
    const blobName = `${Date.now()}-${fileName}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    // Subir el PDF
    await blockBlobClient.uploadData(pdfBuffer, {
      blobHTTPHeaders: {
        blobContentType: "application/pdf",
      },
    })

    // Construir la URL pública
    const publicUrl = blockBlobClient.url

    return {
      ok: true,
      message: "PDF subido exitosamente a Azure Blob Storage",
      url: publicUrl,
    }
  } catch (error) {
    console.error("Error subiendo PDF a Azure:", error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error al subir el PDF a Azure",
    }
  }
}