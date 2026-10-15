import { processDocxFiles } from "./services/romaneios.service";
import {
  processProductData,
  checkProductsInDatabaseAndSite,
} from "./services/products.service";
import { processProductImages } from "./services/grendene.service";
import { generatePDF } from "./services/pdf.service";

async function start(): Promise<void> {
  try {
    // busca os textos romaneios na pasta de entrada
    const extractedTexts = await processDocxFiles();
    // separa (manufactor_code, color_code, barcode) de cada produto do romaneio
    const productData = await processProductData(extractedTexts);
    // verifica se o produto existe no banco de dados e site e retorna os produtos que não foram encontrados
    const notFoundProducts = await checkProductsInDatabaseAndSite(productData);
    // busca as fotos do produto no site da grendene e as baixa na pasta de fotos (output)
    const imageResults = await processProductImages(notFoundProducts);
    // faz um relatório de produtos que não foram encontrados no banco de dados e site
    const pdfPath = await generatePDF(imageResults);
  } catch (error) {}
}
start();
