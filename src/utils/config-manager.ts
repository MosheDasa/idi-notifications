import { writeLog } from "./logger";
import * as dotenv from "dotenv";
interface Config {
  userId: string;
  logLevel: string;
  logDirectory: string;
}

let config: Config | null = null;

export function loadConfig(): Config {
  if (config) {
    return config;
  }

  const userId = "97254"; //process.env.USER_ID;
  if (!userId) {
    console.error("USER_ID environment variable is not set");
    process.exit(1);
  }

  config = {
    userId,
    logLevel: process.env.LOG_LEVEL || "info",
    logDirectory: process.env.LOG_DIRECTORY || "logs",
  };

  return config;
}

export function getConfig(): Config {
  if (!config) {
    return loadConfig();
  }
  return config;
}
