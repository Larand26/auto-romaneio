import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_HOST || "localhost",
  database: process.env.SQLSERVER_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Conectado ao SQL Server com sucesso!");
    return pool;
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco de dados:", err);
    process.exit(1);
  });
