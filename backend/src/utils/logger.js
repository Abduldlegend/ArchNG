import { env } from "../config/env.js";

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[env.NODE_ENV === "production" ? "info" : env.NODE_ENV === "test" ? "error" : "debug"];

function write(level, message, meta) {
  if (levels[level] > currentLevel) return;
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  error: (message, meta) => write("error", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  info: (message, meta) => write("info", message, meta),
  debug: (message, meta) => write("debug", message, meta),
};
