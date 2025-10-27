import PDFDocument, { text } from "pdfkit";
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
    // INFORMACIÓN DE LA COTIZACIÓN
    // ===========================
    const { cotizacion } = invoiceData;

    if (cotizacion) {
      doc.fontSize(12).fillColor("#333333");

      // ===========================
      // Datos del Usuario y Vehículo
      // ===========================
      doc
        .table({
          data: [
            [
              { text: `Nombre: ${cotizacion.name}`, border: false },
              { text: `Marca: ${cotizacion.brand}`, border: false },
            ],
            [
              { text: `Cédula: ${cotizacion.identification}`, border: false },
              { text: `Modelo: ${cotizacion.model}`, border: false },
            ],
            [
              { text: `Ciudad: ${cotizacion.city}`, border: false },
              { text: `Año: ${cotizacion.year}`, border: false },
            ],
            [
              { text: `Email:`, border: false },
              { text: `Valor: ${cotizacion.vehicleValue}`, border: false },
            ],
            [
              { text: `Celular:`, border: false },
              {
                text: `Fecha de Cotización: ${cotizacion.createdAt}`,
                border: false,
              },
            ],
          ],
        })
        .fillColor("black")
        .moveDown(1);
    }

    // ===========================
    // TABLA DE COBERTURAS CON CORTE MANUAL
    // ===========================

    // Construir todas las filas normalmente
    const tableData: any[] = [];
    const headerRow = ["Cobertura", ...plans.map((p: any) => p.insurer)];
    tableData.push(headerRow);

    const filaPrima = [
      "Prima Mensual",
      ...plans.map((p: any) => `$${(p.totalPremium / p.period).toFixed(2)}`),
    ];
    tableData.push(filaPrima);

    // Añadir todas las coberturas
    COBERTURAS_ORDENADAS.forEach((nombre: string, i: number) => {
      const fila = [
        nombre,
        ...plans.map((p: any) => {
          const valor = p.coverageBenefits?.[i] ?? "N/A";
          if (valor === "1" || valor === 1) return "SI";
          if (valor === "0" || valor === 0) return "NO";
          return String(valor).trim() || "N/A";
        }),
      ];
      tableData.push(fila);
    });

    // ===========================
    // Cortar manualmente en dos tablas
    // ===========================

    // por ejemplo, las primeras 8 coberturas + encabezados
    const primeraParte = tableData.slice(0, 10); // encabezado + 9 filas
    const segundaParte = tableData.slice(10); // el resto

    // ---- Primera tabla ----
    doc.moveDown(1);
    doc.table({
      data: primeraParte.map((row: any[]) =>
        row.map((cell) => ({
          text: String(cell),
          border: true,
          fontSize: 9,
        }))
      ),
    });

    // ---- Forzar salto de página ----
    doc.addPage(); // 👈 este es tu corte manual

    // ---- Segunda tabla ----
    doc.table({
      data: segundaParte.map((row: any[]) =>
        row.map((cell) => ({
          text: String(cell),
          border: true,
          fontSize: 9,
        }))
      ),
    });

    
  // ===========================
    // FILAS DE PRIMA NETA Y PRIMA TOTAL
    // ===========================
    doc.moveDown(0.5); // Pequeña separación

    // Fila Prima Neta
    const filaPrimaNeta = [
      "Prima Neta",
      ...plans.map((p: any) => `$${(p.netPremium || 0).toFixed(2)}`),
    ];

    doc.table({
      data: [
        filaPrimaNeta.map((cell) => ({
          text: String(cell),
          border: true,
          fontSize: 9,
        })),
      ],
    });

    // Fila Prima Total
    const filaPrimaTotal = [
      "Prima Total",
      ...plans.map((p: any) => `$${(p.totalPremium || 0).toFixed(2)}`),
    ];

    doc.table({
      data: [
        filaPrimaTotal.map((cell) => ({
          text: String(cell),
          border: true,
          fontSize: 9,
        })),
      ],
    });


    // ===========================
    // PIE DE PÁGINA
    // ===========================
    const bottomY = doc.page.height - doc.page.margins.bottom - 60;

    doc
      .fontSize(9)
      .fillColor("gray")
      .opacity(0.8)
      .text(
        "⚠️  Este documento corresponde a una cotización referencial emitida por Oland Seguros. " +
          "No constituye una póliza ni garantiza la contratación del seguro. " +
          "Las condiciones, coberturas y valores están sujetos a verificación y aprobación por parte de la aseguradora. " +
          "La validez de esta cotización es de 15 días calendario a partir de su fecha de emisión.",
        40,
        bottomY,
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
