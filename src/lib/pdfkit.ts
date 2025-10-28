import PDFDocument, { text } from "pdfkit";
import path from "path";
import { COBERTURAS_ORDENADAS } from "@/configuration/constants";
import { AseguradorasLogo } from "@/configuration/constants";

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
      // Formateos previos
      // ===========================
      const fechaFormateada = new Date(cotizacion.createdAt).toLocaleDateString(
        "es-EC",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

      const valorFormateado = new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(cotizacion.vehicleValue || 0);

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
              { text: `Valor: ${valorFormateado}`, border: false },
            ],
            [
              { text: `Celular:`, border: false },
              {
                text: `Fecha de Cotización:  ${fechaFormateada}`,
                border: false,
              },
            ],
          ],
        })
        .fillColor("black")
        .moveDown(1);
    }
    // ===========================
    // Fila de logos dinámicos (ajuste automático)
    // ===========================

    doc.moveDown(1);

    const y = doc.y;
    let imageWidth = 100;
    let imageHeight = 65;
    let startX = 185;
    let spacing = 130;

    // Ajustes simples según cantidad de planes
    if (plans.length === 2) {
      // si solo hay 2 logos, los centramos más y los hacemos un poco más grandes
      imageWidth = 120;
      imageHeight = 70;
      startX = 240; // movemos más al centro
      spacing = 170; // más distancia entre ambos
    } else if (plans.length === 1) {
      // si hay solo uno, centrado en la página
      imageWidth = 140;
      imageHeight = 80;
      startX = (doc.page.width - imageWidth) / 2;
      spacing = 0;
    }

    // recorrer los planes seleccionados
    plans.forEach((plan: any, index: number) => {
      const logoObj = AseguradorasLogo.find((logo) =>
        logo.name.toLowerCase().includes(plan.insurer.toLowerCase())
      );

      const logoPath = logoObj
        ? path.join(process.cwd(), "public", logoObj.img)
        : null;

      if (logoPath) {
        try {
          doc.image(logoPath, startX + index * spacing, y, {
            fit: [imageWidth, imageHeight],
          });
        } catch (err) {
          console.error("⚠️ No se pudo cargar el logo:", logoPath, err);
        }
      }
    });

    doc.moveDown(3);

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

    doc.moveDown(1);
    doc.table({
      defaultStyle: {
        border: 1,
        padding: 4,
      },
      // Estilos por columna
      columnStyles: ((i: number) => {
        if (i === 0) return { backgroundColor: "#0b2240", textColor: "white" }; // 👈 azul solo para la columna Cobertura
        return { align: "center" } as unknown as any;
      }) as unknown as any,
      data: primeraParte,
    });

    // ---- Forzar salto de página ----
    doc.addPage(); // 👈 este es tu corte manual

    // ---- Segunda tabla ----
    doc.table({
      defaultStyle: {
        border: 1,
        padding: 4,
      },
      columnStyles: ((i: number) => {
        if (i === 0) return { backgroundColor: "#0b2240", textColor: "white" }; // 👈 igual, azul en la columna de coberturas
        return { align: "center" } as unknown as any;
      }) as unknown as any,
      data: segundaParte,
    });

    // ===========================
    // FILAS DE PRIMA NETA Y PRIMA TOTAL
    // ===========================
    doc.moveDown(0.5); // Pequeña separación

    // ===========================
    // Fila Prima Neta
    // ===========================
    const filaPrimaNeta = [
      "Prima Neta",
      ...plans.map((p: any) => `$${(p.netPremium || 0).toFixed(2)}`),
    ];

    doc.table({
      defaultStyle: {
        border: 1,
        padding: 4,
      },
      columnStyles: ((i: number) => {
        if (i === 0) return { align: "left" } as unknown as any; // título a la izquierda
        return { align: "center" } as unknown as any; // valores centrados
      }) as unknown as any,
      data: [filaPrimaNeta],
    });

    // Fila Prima Total
    const filaPrimaTotal = [
      "Prima Total",
      ...plans.map((p: any) => `$${(p.totalPremium || 0).toFixed(2)}`),
    ];

    doc.table({
      defaultStyle: {
        border: 1,
        padding: 4,
      },
      // 👇 misma solución que tu tabla principal, sin errores TS
      columnStyles: ((i: number) => {
        if (i === 0) return { align: "left" }; // primera columna alineada a la izquierda
        return { align: "center" } as unknown as any; // las demás centradas
      }) as unknown as any,
      data: [filaPrimaTotal],
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
