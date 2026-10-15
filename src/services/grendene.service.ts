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
): Promise<{ success: boolean; photo?: Buffer }> {
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
    return { success: true, photo: Buffer.from(response.data) };
  } catch (error) {
    await sleep(1000); // Aguarda 1 segundo antes de tentar novamente
    return { success: false };
  }
}

export async function processProductImages(
  products: Product[],
): Promise<Product[]> {
  // remove duplicados por manufacturer_code + color_code
  const seen = new Set<string>();
  const filteredProducts = products.filter((product) => {
    const key = `${product.manufacturer_code}-${product.color_code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const perProduct = await Promise.all(
    filteredProducts.map(async (product) => {
      // as 4 posições do produto são baixadas em paralelo
      const attempts = await Promise.all(
        Array.from({ length: 4 }, async (_, i) => {
          const position = String(i).padStart(2, "0");
          const result = await downloadProductImage(
            product.manufacturer_code,
            product.color_code,
            position,
          );
          return { ...product, position, ...result };
        }),
      );

      // reproduz o "break": mantém até a primeira falha (inclusive)
      const firstFail = attempts.findIndex((r) => !r.success);
      return firstFail === -1 ? attempts : attempts.slice(0, firstFail + 1);
    }),
  );

  return perProduct.flat();
}
