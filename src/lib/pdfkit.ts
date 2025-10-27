import PDFDocument from "pdfkit";
import path from "path";
import { COBERTURAS_ORDENADAS } from "@/configuration/constants";

export function buildPDFBuffer(invoiceData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Outfit-Regular.ttf"
    );

    const doc = new PDFDocument({
      autoFirstPage: true,
      font: fontPath,
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ===========================
    // ENCABEZADO
    // ===========================
    doc
      .fontSize(20)
      .text("Comparación de Planes - Oland Seguros", { align: "center" })
      .moveDown(1);

    const plans = Array.isArray(invoiceData?.selectedPlans)
      ? invoiceData.selectedPlans
      : [];

    if (plans.length === 0) {
      doc.fontSize(12).text("Sin planes seleccionados.");
      doc.end();
      return;
    }

    // ===========================
    // TABLA DE COBERTURAS
    // ===========================
    const startX = doc.x;
    const startY = doc.y;
    const firstColWidth = 120; // ancho columna "Cobertura"
    const colWidth = 140; // ancho columnas de aseguradoras

    // ---- Encabezado ----
    doc
      .fontSize(10)
      .text("Cobertura", startX, startY, { width: firstColWidth });
    plans.forEach((plan: any, index: number) => {
      const x = startX + firstColWidth + index * colWidth;
      doc.text(plan.insurer, x, startY, { width: colWidth, align: "left" });
    });
    doc.moveDown(1);

    // ---- Fila: Prima Mensual ----
    const primaY = doc.y;
    doc
      .fontSize(9)
      .text("Prima Mensual", startX, primaY, { width: firstColWidth });

    plans.forEach((plan: any, index: number) => {
      const primaMensual = (plan.totalPremium / 12).toFixed(2);
      const x = startX + firstColWidth + index * colWidth;
      doc.text(`$${primaMensual}`, x, primaY, {
        width: colWidth,
        align: "left",
      });
    });

    doc.moveDown(2);

    // ---- Filas de coberturas ----
    COBERTURAS_ORDENADAS.forEach((nombre: string, i: number) => {
      const y = doc.y;
      doc.fontSize(9).text(nombre, startX, y, { width: firstColWidth });

      plans.forEach((plan: any, index: number) => {
        const valor = plan.coverageBenefits?.[i] ?? "N/A";
        const x = startX + firstColWidth + index * colWidth;
        let texto = "";

        if (valor === "1" || valor === 1) texto = "✅";
        else if (valor === "0" || valor === 0) texto = "❌";
        else texto = String(valor).trim() || "N/A";

        doc.text(texto, x, y, { width: colWidth, align: "left" });
      });

      doc.moveDown(2);
    });

    // ===========================
    // PIE DE PÁGINA
    // ===========================
    // ===========================
    // PIE DE PÁGINA FIJO
    // ===========================
    const bottomY = doc.page.height - doc.page.margins.bottom - 60; // distancia desde el borde inferior

    doc
      .fontSize(9)
      .fillColor("gray")
      .opacity(0.8)
      .text(
        "⚠️  Este documento corresponde a una cotización referencial emitida por Oland Seguros. " +
          "No constituye una póliza ni garantiza la contratación del seguro. " +
          "Las condiciones, coberturas y valores están sujetos a verificación y aprobación por parte de la aseguradora. " +
          "La validez de esta cotización es de 15 días calendario a partir de su fecha de emisión.",
        40, // margen izquierdo
        bottomY, // posición vertical fija
        { width: doc.page.width - 80, align: "justify" }
      )
      .moveDown(0.5)
      .fontSize(10)
      .opacity(0.6)
      .text("Generado automáticamente por Oland Seguros", { align: "center" })
      .opacity(1)
      .fillColor("black");

    doc.end();
  });
}
