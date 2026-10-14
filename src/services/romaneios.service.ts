import { env } from "../config/env";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { createWorker } from "tesseract.js";

// busca todos os arquivos .docx na pasta de entrada
async function getDocxFiles(): Promise<string[]> {
  const inputFolder = env.INPUT_FILES_PATH;
  const files = fs.readdirSync(inputFolder);
  return files.filter((file) => path.extname(file) === ".docx");
}

// extrai o conteúdo (as imagens) de um arquivo .docx e retorna o texto delas
async function extractImagesFromDocx(docxFilePath: string): Promise<string[]> {
  const zip = new AdmZip(docxFilePath);
  const zipEntries = zip.getEntries();

  const imageEntries = zipEntries.filter((entry) =>
    entry.entryName.startsWith("word/media/"),
  );

  // Inicializa o worker do Tesseract para português
  const worker = await createWorker("por");
  const extractedTexts: string[] = [];

  for (const entry of imageEntries) {
    const imageBuffer = entry.getData();

    try {
      // Executa o OCR diretamente no buffer da imagem obtida do zip
      const {
        data: { text },
      } = await worker.recognize(imageBuffer);

      if (text && text.trim().length > 0) {
        extractedTexts.push(text.trim());
      }
    } catch (error) {
      console.error(`Erro ao processar a imagem ${entry.entryName}:`, error);
    }
  }

  // Finaliza o worker para liberar recursos
  await worker.terminate();

  return extractedTexts;
}

// função para processar todos os arquivos .docx na pasta de entrada
export async function processDocxFiles(): Promise<string[]> {
  const docxFiles = await getDocxFiles();
  const extractedTexts: string[] = []; // Array principal que será retornado

  for (const docxFile of docxFiles) {
    const docxFilePath = path.join(env.INPUT_FILES_PATH, docxFile);

    // Mudamos o nome para 'fileTexts' para não sombrear a variável de fora
    const fileTexts = await extractImagesFromDocx(docxFilePath);

    // Adicionamos os textos extraídos deste arquivo ao array principal
    extractedTexts.push(...fileTexts);
  }

  return extractedTexts;
}
