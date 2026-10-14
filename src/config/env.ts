import dotenv from "dotenv";

dotenv.config();

export const env = {
  INPUT_FILES_PATH: process.env.INPUT_FILES_PATH || "",
  OUTPUT_FILES_PATH: process.env.OUTPUT_FILES_PATH || "",
};
