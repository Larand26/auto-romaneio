import { processDocxFiles } from "./services/romaneios.service";

async function start(): Promise<void> {
  try {
    // busca os textos romaneios na pasta de entrada
    const extractedTexts = await processDocxFiles();
    console.log("Textos extraídos dos romaneios:", extractedTexts);
    // separa (manufactor_code, color_code, barcode) de cada produto do romaneio
    // verifica se o produto existe no banco de dados e site
    // busca as fotos do produto no site da grendene e as baixa na pasta de fotos (output)
    // faz um relatório de produtos que não foram encontrados no banco de dados e site
  } catch (error) {}
}
start();
