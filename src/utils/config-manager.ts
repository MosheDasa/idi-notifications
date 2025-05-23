import fs from "fs";
import path from "path";
import { app } from "electron";
import { writeLog } from "./logger";

export interface Config {
  API_URL: string;
  API_NOTIFICATIONS_ENDPOINT: string;
  API_POLLING_INTERVAL: number;
  LOG: boolean;
  USER_ID: string;
  USER_NAME: string;
  OPEN_DEV_TOOLS: boolean;
}

// Get environment variables with fallbacks
function getEnvVar(key: string, defaultValue: string): string {
  return process.env[`VITE_${key}`] || defaultValue;
}

function getEnvVarBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[`VITE_${key}`];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const value = process.env[`VITE_${key}`];
  if (value === undefined) return defaultValue;
  return parseInt(value, 10) || defaultValue;
}

const DEFAULT_CONFIG: Config = {
  API_URL: getEnvVar("API_URL", "http://localhost:3001/notifications/check"),
  API_NOTIFICATIONS_ENDPOINT: getEnvVar("API_NOTIFICATIONS_ENDPOINT", "http://localhost:8083/idiwebsocket"),
  API_POLLING_INTERVAL: getEnvVarNumber("API_POLLING_INTERVAL", 10000),
  LOG: getEnvVarBool("LOG", true),
  USER_ID: "97254",
  USER_NAME: "97254",
  OPEN_DEV_TOOLS: getEnvVarBool("OPEN_DEV_TOOLS", false),
};

export function getConfigPath(): string {
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
