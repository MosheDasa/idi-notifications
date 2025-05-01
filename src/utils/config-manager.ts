import fs from "fs";
import path from "path";
import { app } from "electron";
import { writeLog } from "./logger";

export interface Config {
  API_URL: string;
  API_POLLING_INTERVAL: number;
  LOG: boolean;
  userId: string;
}

const DEFAULT_CONFIG: Config = {
  API_URL: "http://localhost:3001/notifications/check",
  API_POLLING_INTERVAL: 10000,
  LOG: true,
  userId: "97254",
};

function getConfigPath(): string {
  return path.join(
    process.env.USERPROFILE || "",
    "idi-notifications-config",
    "config.json"
  );
}

function createDefaultConfig(configPath: string): void {
  try {
    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write default config
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    writeLog("INFO", "DEFAULT_CONFIG_CREATED", { path: configPath });
  } catch (error) {
    writeLog("ERROR", "DEFAULT_CONFIG_CREATION_FAILED", {
      error: error instanceof Error ? error.message : String(error),
      path: configPath,
    });
    throw error;
  }
}

export function loadConfig(): Config {
  try {
    const configPath = getConfigPath();
    writeLog("INFO", "LOADING_CONFIG", { path: configPath });

    // If config doesn't exist, create default
    if (!fs.existsSync(configPath)) {
      writeLog("INFO", "CONFIG_NOT_FOUND", { path: configPath });
      createDefaultConfig(configPath);
    }

    // Read and parse config
    const configContent = fs.readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(configContent);

    // Merge with default config to ensure all fields exist
    const config: Config = { ...DEFAULT_CONFIG, ...userConfig };

    writeLog("INFO", "CONFIG_LOADED", { config });
    return config;
  } catch (error) {
    writeLog("ERROR", "CONFIG_LOAD_FAILED", {
      error: error instanceof Error ? error.message : String(error),
    });
    return DEFAULT_CONFIG;
  }
}

export function updateConfig(newConfig: Partial<Config>): void {
  try {
    const configPath = getConfigPath();
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };

    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
    writeLog("INFO", "CONFIG_UPDATED", { config: updatedConfig });
  } catch (error) {
    writeLog("ERROR", "CONFIG_UPDATE_FAILED", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
