import type { Product } from "../types/product.model";
import { findProductsByBarCodes } from "../repositories/product.repository";

export async function processProductData(
  extractedTexts: string[],
): Promise<Product[]> {
  // Mapeia cada texto para uma operação assíncrona e aguarda todas concluírem em paralelo
  const promises = extractedTexts.map(async (text) => {
    const lines = text.split("\n");
    const productData: Product[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const l = line.trim().replace(/—/g, " ").replace(/\s+/g, " ");

      if (l === "Atacado de Calçados Grendene") continue;

      const spaceIndex1 = l.indexOf(" ");
      if (spaceIndex1 === -1) {
        console.warn(`Linha inválida: ${l}`);
        continue;
      }

      const spaceIndex2 = l.indexOf(" ", spaceIndex1 + 1);
      if (spaceIndex2 === -1) {
        console.warn(`Linha inválida: ${l}`);
        continue;
      }

      const firstToken = l.substring(0, spaceIndex1);
      const manufacturer_code = firstToken.substring(0, 5);
      const color_code = firstToken.substring(6, 11);

      const barcodeRaw = l.substring(spaceIndex1 + 1, spaceIndex2);
      const barcode = barcodeRaw.replace("]", "1");

      const name = l.substring(spaceIndex2 + 1);

      if (!manufacturer_code || !barcode) {
        console.warn(`Linha inválida: ${l}`);
        continue;
      }

      productData.push({
        manufacturer_code,
        color_code,
        barcode,
        name,
      });
    }

    return productData;
  });

  // Aguarda a resolução de todos os arrays processados e os une em um único array final
  const results = await Promise.all(promises);
  return results.flat();
}

export async function checkProductsInDatabaseAndSite(
  productData: Product[],
): Promise<Product[]> {
  const notFoundProducts: Product[] = [];
  const barcodes = productData.map((product) => product.barcode);
  const foundProducts = await findProductsByBarCodes(barcodes);

  const foundBarcodes = new Set(
    foundProducts.map((product) => product.barcode),
  );

  for (const product of productData) {
    if (!foundBarcodes.has(product.barcode)) {
      notFoundProducts.push(product);
    }
  }
  return notFoundProducts;
}
