import PDFDocument from "pdfkit-table";
import type { Product } from "../types/product.model";
import { env } from "../config/env";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

export async function generatePDF(products: Product[]): Promise<string> {
  const outputDirectory = env.OUTPUT_REPORT_PATH || ".";
  const outputPath = path.join(
    outputDirectory,
    "relatorio-ativacao-produtos.pdf",
  );

  try {
    await mkdir(outputDirectory, { recursive: true });

    const document = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 30,
    });
    const outputStream = createWriteStream(outputPath);

    document.pipe(outputStream);
    document
      .fontSize(18)
      .fillColor("#333333")
      .text("Relatório de Ativação de Produtos");
    document
      .fontSize(10)
      .fillColor("#333333")
      .text(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
    document.moveDown();

    await document.table(
      {
        headers: [
          {
            label: "Foto",
            property: "photo",
            width: 55,
            align: "center",
            renderer: (
              value,
              _indexColumn,
              indexRow,
              _row,
              _rectRow,
              rectCell,
            ) => {
              const photo =
                indexRow === undefined ? undefined : products[indexRow]?.photo;

              if (!photo || !rectCell) {
                return value;
              }

              document.image(photo, rectCell.x + 4, rectCell.y + 4, {
                fit: [rectCell.width - 8, rectCell.height - 8],
                align: "center",
                valign: "center",
              });

              return "";
            },
          },
          {
            label: "Código do Fabricante",
            property: "manufacturer_code",
            width: 105,
          },
          { label: "Nome do Produto", property: "name", width: 260 },
          { label: "Código da Cor", property: "color_code", width: 75 },
          { label: "Posição", property: "position", width: 60 },
          { label: "Código de barras", property: "barcode", width: 100 },
        ],
        data: products.map((product) => ({
          photo: product.photo ? "" : "-",
          manufacturer_code: product.manufacturer_code,
          name:
            product.name.substring(0, 30) +
            (product.name.length > 30 ? "..." : ""),
          color_code: product.color_code,
          position: product.position || "-",
          barcode: product.barcode,
        })),
      },
      {
        width:
          document.page.width -
          document.page.margins.left -
          document.page.margins.right,
        padding: 6,
        minRowHeight: 55,
        columnSpacing: 4,
        divider: {
          header: { color: "#f16064", opacity: 1 },
          horizontal: { color: "#dddddd", opacity: 1 },
        },
        prepareHeader: () => {
          document.font("Helvetica-Bold").fontSize(9).fillColor("white");
        },
        prepareRow: () => {
          document.font("Helvetica").fontSize(8).fillColor("#333333");
        },
      },
    );

    document.end();
    await new Promise<void>((resolve, reject) => {
      outputStream.once("finish", resolve);
      outputStream.once("error", reject);
    });

    return outputPath;
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    throw error;
  }
}
