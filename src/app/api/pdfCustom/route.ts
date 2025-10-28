//Api para customizar PDF
import { buildPDFBuffer } from "@/lib/pdfkitCustom";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const buffer = await buildPDFBuffer(body);

    return new Response(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="planes.pdf"',
      },
    });
  } catch (error) {
    console.error("❌ Error en /api/pdf:", error);
    return new Response("Error generando PDF", { status: 500 });
  }
}
