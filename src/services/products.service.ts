import type { Product } from "../types/product.model";

export async function processProductData(
  extractedTexts: string[],
): Promise<Product[]> {
  const productData: Product[] = [];

  for (const text of extractedTexts) {
    const lines: string[] = text.split("\n");

    for (const line of lines) {
      let l = line.trim().replace(/—/g, " ").replace(/\s+/g, " ");
      if (l === "Atacado de Calçados Grendene") continue;
      const parts = l.split(" ");
      if (parts.length < 3) {
        console.warn(`Linha inválida: ${l}`);
        continue;
      }

      const manufacturer_code = parts[0]?.substring(0, 5) || "";
      const color_code = parts[0]?.substring(6, 11) || "";
      const barcode = parts[1]?.replace("]", "1") || "";
      const name = parts.slice(2).join(" ") || "";

      productData.push({
        manufacturer_code,
        color_code,
        barcode,
        name,
      });
    }
  }
  return productData;
}
