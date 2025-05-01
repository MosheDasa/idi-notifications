import * as dotenv from "dotenv";
import { writeLog } from "./logger";

export interface Config {
  userId: string;
  logLevel: string;
  logDirectory: string;
}

let config: Config | null = null;

export function loadConfig(): Config {
  if (config) {
    return config;
  }

  try {
    // Load environment variables
    dotenv.config();

    const userId = "97254"; // Hardcoded for now, should be replaced with process.env.USER_ID
    if (!userId) {
      throw new Error("USER_ID environment variable is not set");
    }

    config = {
      userId,
      logLevel: process.env.LOG_LEVEL || "info",
      logDirectory: process.env.LOG_DIRECTORY || "logs",
    };

    return config;
  } catch (error) {
    console.error("Failed to load configuration:", error);
    process.exit(1);
  }
}

export function getConfig(): Config {
  if (!config) {
    return loadConfig();
  }
  return config;
}
