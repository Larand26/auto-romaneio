import PDFDocument from "pdfkit-table";
import type { Product } from "../types/product.model";
import { env } from "../config/env";
import { createWriteStream } from "fs";
import path from "node:path";

export async function generatePDF(products: Product[]): Promise<void> {
  try {
    // Usando o PDFDocument do pdfkit-table
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const outputPath = path.join(env.OUTPUT_REPORT_PATH, "relatorio.pdf");

    doc.pipe(createWriteStream(outputPath));

    const table = {
      headers: ["Manufacturer Code", "Color Code", "Barcode", "Name"],
      rows: products.map((product) => [
        product.manufacturer_code,
        product.color_code,
        product.barcode,
        product.name,
      ]),
    };

    // Adicionado await, pois a renderização da tabela é assíncrona
    await doc.table(table, {
      width: 500,
    });

    doc.end();

    console.log("PDF gerado com sucesso em:", outputPath);
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    throw error;
  }
}
