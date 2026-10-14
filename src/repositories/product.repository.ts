import { poolPromise } from "../config/db";
import sql from "mssql";

export async function findProductsByBarCodes(barCodes: string[]) {
  try {
    if (!barCodes || barCodes.length === 0) return [];

    const pool = await poolPromise;
    const request = pool.request();

    // Cria dinamicamente parâmetros como @p0, @p1, @p2 para evitar SQL Injection
    const paramNames = barCodes.map((code, index) => {
      const paramName = `p${index}`;
      request.input(paramName, sql.VarChar, code);
      return `@${paramName}`;
    });

    const query = `SELECT P.[PROD_CODBARRA] as barcode 
FROM [PRODUTOS] P
LEFT JOIN [PRODUTOS_EMPRESASFILIAIS] PA ON P.[ID_CODPRODUTO] = PA.[ID_CODPRODUTO]
WHERE P.[PROD_CODBARRA] IN (${paramNames.join(",")})
AND PA.[PRO_INTEGRACAO_ECOMMERCE] = 1
AND PA.[PRO_ATIVO_ECOMMERCE] = 1`;

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Erro ao buscar produtos no banco de dados:", error);
    throw error;
  }
}
