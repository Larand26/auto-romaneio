import type { Product } from "../types/product.model";
import { env } from "../config/env";
import axios from "axios";
import fs from "node:fs/promises";
import path from "node:path";
import { sleep } from "../utils/sleep";

async function downloadProductImage(
  manufacturerCode: string,
  colorCode: string,
  position: string,
): Promise<Boolean> {
  try {
    const imageUrl = `https://api-uai.grendene.com.br/api/material/getmaterial?n=${manufacturerCode}${colorCode}${position}&d=IMAGEM_GRANDE_JPG`;
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const outputDir = `${env.OUTPUT_FILES_PATH}/${manufacturerCode}`;
    await fs.mkdir(outputDir, { recursive: true });

    console.log(
      `Baixando imagem do produto: ${manufacturerCode} - ${colorCode} - Posição: ${position}`,
    );

    const imagePath = path.join(
      outputDir,
      `${manufacturerCode}_${colorCode}_${position}.jpg`,
    );

    await fs.writeFile(imagePath, Buffer.from(response.data));
    return true;
  } catch (error) {
    await sleep(1000); // Aguarda 1 segundo antes de tentar novamente
    return false;
  }
}

export async function processProductImages(
  products: Product[],
): Promise<Product[]> {
  // filtra produtos repetidos com base no manufacturer_code e color_code
  const filteredProducts: Product[] = [];
  const seen = new Set<string>();
  for (const product of products) {
    const key = `${product.manufacturer_code}-${product.color_code}`;
    if (!seen.has(key)) {
      seen.add(key);
      filteredProducts.push(product);
    }
  }

  const results: any[] = [];
  for (const product of filteredProducts) {
    for (let position = 0; position < 5; position++) {
      const success = await downloadProductImage(
        product.manufacturer_code,
        product.color_code,
        String(position).padStart(2, "0"),
      );

      results.push(
        product.manufacturer_code,
        product.color_code,
        position,
        success,
      );

      if (!success) break;
    }
  }
  return results;
}
