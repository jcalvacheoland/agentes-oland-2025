import PDFDocument from "pdfkit";
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

    // asegurar que la fuente esté aplicada
    doc.font(fontPath);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // -----------------------
    // UTIL: drawTableManual
    // -----------------------
    function drawTableManual(
      doc: any,
      tableData: (string | { text: string })[][],
      opts: {
        x?: number;
        y?: number;
        columnWidths?: number[];
        rowHeight?: number;
        padding?: number;
        headerBg?: string;
        firstColBg?: string;
        headerTextColor?: string;
        firstColTextColor?: string;
        fontSize?: number;
      } = {}
    ) {
      const x = opts.x ?? 40;
      let curY = opts.y ?? doc.y;
      const padding = opts.padding ?? 8;
      const rowHeight = opts.rowHeight ?? 40;
      const headerBg = opts.headerBg ?? "#0b2240";
      const firstColBg = opts.firstColBg ?? "#0b2240";
      const headerTextColor = opts.headerTextColor ?? "white";
      const firstColTextColor = opts.firstColTextColor ?? "black";
      const fontSize = opts.fontSize ?? 10;

      const columnCount = (tableData[0] || []).length;
      const totalWidth =
        opts.columnWidths?.reduce((a: number, b: number) => a + b, 0) ??
        doc.page.width - x - 40;
      const columnWidths =
        opts.columnWidths ??
        Array.from({ length: columnCount }, () => totalWidth / columnCount);

      const bottomLimit = doc.page.height - doc.page.margins.bottom - 60;

      // recorrer filas
      for (let r = 0; r < tableData.length; r++) {
        // salto de página si se excede
        if (curY + rowHeight > bottomLimit) {
          doc.addPage();
          doc.font(fontPath);
          curY = doc.page.margins.top;
        }

        let curX = x;
        const row = tableData[r];

        for (let c = 0; c < columnCount; c++) {
          const cellRaw = row[c];
          const text =
            typeof cellRaw === "object"
              ? (cellRaw as any).text
              : String(cellRaw ?? "");
          const colW = columnWidths[c] ?? totalWidth / columnCount;

          // fondo & borde
          if (r === 0 && c === 0) {
            // CELDA [0,0] - "Plan" - igual que primera columna
            doc.save();
            doc.fillColor(firstColBg).rect(curX, curY, colW, rowHeight).fill();
            doc
              .strokeColor("#000000")
              .rect(curX, curY, colW, rowHeight)
              .stroke();
            doc.restore();
            doc.fillColor(firstColTextColor);
          } else if (r === 0) {
            // RESTO DEL HEADER (r=0 pero c>0)
            doc.save();
            doc.fillColor(headerBg).rect(curX, curY, colW, rowHeight).fill();
            doc
              .strokeColor("#000000")
              .rect(curX, curY, colW, rowHeight)
              .stroke();
            doc.restore();
            doc.fillColor(headerTextColor);
          } else if (c === 0) {
            // PRIMERA COLUMNA (pero r>0)
            doc.save();
            doc.fillColor(firstColBg).rect(curX, curY, colW, rowHeight).fill();
            doc
              .strokeColor("#000000")
              .rect(curX, curY, colW, rowHeight)
              .stroke();
            doc.restore();
            doc.fillColor(firstColTextColor);
          } else {
            // celdas normales
            doc
              .strokeColor("#000000")
              .rect(curX, curY, colW, rowHeight)
              .stroke();
            doc.fillColor("#333333");
          }
          // centrar verticalmente
          doc.font(fontPath).fontSize(fontSize);
          const textWidth = colW - padding * 2;
          const textHeight = doc.heightOfString(text, { width: textWidth });
          const textY = curY + Math.max(padding, (rowHeight - textHeight) / 2);

          const align = c === 0 ? "left" : "center";
          doc.text(text, curX + padding, textY, { width: textWidth, align });

          curX += colW;
        }

        curY += rowHeight;
      }

      doc.y = curY + 6;
    }

    // -----------------------
    // ENCABEZADO
    // -----------------------
    const headerHeight = 60;
    doc.rect(0, 0, doc.page.width, headerHeight).fill("#ffffff");
    doc
      .fillColor("#0b2240")
      .fontSize(20)
      .text("COTIZACIÓN DE SU SEGURO", 40, 20, {
        align: "left",
      });

    const logoPath = path.join(
      process.cwd(),
      "public",
      "img",
      "agentesLogo.jpg"
    );
    try {
      doc.image(logoPath, doc.page.width - 100, 10, {
        width: 50,
        height: 45,
      });
    } catch (err) {
      console.warn("No se cargó logo encabezado:", err);
    }

    doc.moveDown(2);

    // -----------------------
    // PLANES SELECCIONADOS
    // -----------------------
    const plans = Array.isArray(invoiceData?.selectedPlans)
      ? invoiceData.selectedPlans
      : [];
    if (plans.length === 0) {
      doc.fontSize(12).text("Sin planes seleccionados.");
      doc.end();
      return;
    }

    // -----------------------
    // DATOS COTIZACIÓN (cliente/vehículo)
    // -----------------------
    const { cotizacion } = invoiceData;
    if (cotizacion) {
      doc.fontSize(12).fillColor("#333333");
      const fechaFormateada = new Date(cotizacion.createdAt).toLocaleDateString(
        "es-EC",
        { day: "2-digit", month: "2-digit", year: "numeric" }
      );
      const valorFormateado = new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(cotizacion.vehicleValue || 0);

      doc
        .table({
          data: [
            [
              {
                text: `Nombre: ${cotizacion.name}`,
                border: [true, false, false, true],
              }, // arriba + izquierda
              {
                text: `Marca: ${cotizacion.brand}`,
                border: [true, true, false, false],
              }, // arriba + derecha
            ],
            [
              {
                text: `Cédula: ${cotizacion.identification}`,
                border: [false, false, false, true],
              },
              {
                text: `Modelo: ${cotizacion.model}`,
                border: [false, true, false, false],
              },
            ],
            [
              {
                text: `Ciudad: ${cotizacion.city}`,
                border: [false, false, false, true],
              },
              {
                text: `Año: ${cotizacion.year}`,
                border: [false, true, false, false],
              },
            ],
            [
              { text: `Email:`, border: [false, false, false, true] },
              {
                text: `Valor: ${valorFormateado}`,
                border: [false, true, false, false],
              },
            ],
            [
              { text: `Celular:`, border: [false, false, true, true] }, // abajo + izquierda
              {
                text: `Fecha de Cotización:  ${fechaFormateada}`,
                border: [false, true, true, false],
              }, // abajo + derecha
            ],
          ],
        })

        .fillColor("black")
        .moveDown(1);
    }

    // -----------------------
    // Fila de logos (mejorada)
    // -----------------------
    doc.moveDown(1);

    const leftMargin = doc.page.margins.left;
    const usableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const totalColumns = 1 + plans.length;
    const colWidth = usableWidth / totalColumns;
    const rowHeightLogos = 80;
    const yStart = doc.y;

    function drawCell(
      x: number,
      y: number,
      width: number,
      height: number,
      imagePath: string,
      text: string,
      isFirst: boolean
    ) {
      const savedY = doc.y;
      const savedX = doc.x;

      // borde de celda
      doc.strokeColor("#000000").rect(x, y, width, height).stroke();

      // imagen (fit dentro de un area)
      try {
        doc.image(imagePath, x + 10, y + 8, {
          fit: [width - 20, height - 36],
          align: "center",
          valign: "center",
        });
      } catch (err) {
        // si falla, no romper
        // console.error("⚠️ Error cargando imagen:", imagePath, err);
      }

      // nombre del plan (fuente más grande que antes)
      doc
        .font(fontPath)
        .fontSize(10)
        .fillColor("#333333")
        .text(text, x + 6, y + height - 20, {
          width: width - 12,
          align: "center",
        });

      doc.x = savedX;
      doc.y = savedY;
    }

    // Título PLANES (primera columna)
    doc
      .strokeColor("#000000")
      .rect(leftMargin, yStart, colWidth, rowHeightLogos)
      .stroke();
    doc
      .font(fontPath)
      .fontSize(11)
      .fillColor("#0b2240")
      .text("Aseguradoras", leftMargin + 5, yStart + rowHeightLogos / 2 - 6, {
        width: colWidth - 10,
        align: "center",
      });

    // logos para cada plan
    plans.forEach((plan: any, index: number) => {
      const x = leftMargin + colWidth + index * colWidth;
      const logoObj = AseguradorasLogo.find((logo: any) =>
        logo.name
          .toLowerCase()
          .includes(String(plan.insurer || "").toLowerCase())
      );
      const logoPathPlan = logoObj
        ? path.join(process.cwd(), "public", logoObj.img)
        : path.join(process.cwd(), "public", "img", "default.png");
      const planName = plan.insurer || `Plan ${index + 1}`;
      drawCell(
        x,
        yStart,
        colWidth,
        rowHeightLogos,
        logoPathPlan,
        planName,
        false
      );
    });

    // mover cursor debajo de logos
    doc.y = yStart + rowHeightLogos;
    doc.x = leftMargin;

    // -----------------------
    // Construir datos de tabla de coberturas
    // -----------------------
    const tableData: any[] = [];
    const headerRow = ["Plan", ...plans.map((p: any) => p.planName)];
    tableData.push(headerRow);

    const filaPrima = [
      "Prima Mensual",
      ...plans.map((p: any) => `$${(p.totalPremium / p.period).toFixed(2)}`),
    ];
    tableData.push(filaPrima);

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

    const columnsSize = new Array(totalColumns).fill(colWidth);

    // -----------------------
    // Dibujar tabla completa de una sola vez
    // -----------------------
    doc.font(fontPath);
    drawTableManual(doc, tableData, {
      x: leftMargin,
      y: doc.y,
      columnWidths: columnsSize,
      rowHeight: 50, // <-- ajusta según necesites
      firstColBg: "#0b2240",
      headerTextColor: "#000000",
      firstColTextColor: "#ffffff",
      headerBg: "#ffffff",
      fontSize: 10,
    });

    // -----------------------
    // Filas de Prima Neta y Prima Total
    // -----------------------
    doc.moveDown(0.5);

    const filaPrimaNeta = [
      "Prima Neta",
      ...plans.map((p: any) => `$${(p.netPremium || 0).toFixed(2)}`),
    ];
    drawTableManual(doc, [["Prima Neta", ...filaPrimaNeta.slice(1)]], {
      x: leftMargin,
      y: doc.y,
      columnWidths: columnsSize,
      rowHeight: 34,
      padding: 8,
      headerBg: "#ffffff",
      firstColBg: "#ffffff",
      headerTextColor: "#000000",
      firstColTextColor: "#000000",
      fontSize: 10,
    });

    const filaPrimaTotal = [
      "Prima Total",
      ...plans.map((p: any) => `$${(p.totalPremium || 0).toFixed(2)}`),
    ];
    drawTableManual(doc, [["Prima Total", ...filaPrimaTotal.slice(1)]], {
      x: leftMargin,
      y: doc.y,
      columnWidths: columnsSize,
      rowHeight: 34,
      padding: 8,
      headerBg: "#ffffff",
      firstColBg: "#ffffff",
      headerTextColor: "#000000",
      firstColTextColor: "#000000",
      fontSize: 10,
    });

    // -----------------------
    // PIE DE PÁGINA
    // -----------------------
    const bottomY = doc.page.height - doc.page.margins.bottom - 60;
    doc
      .font(fontPath)
      .fontSize(10)
      .fillColor("black")
      .opacity(0.8)
      .text(
        "Este documento corresponde a una cotización referencial emitida por Oland Seguros. " +
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
      .fillColor("black");

    doc.end();
  });
}
