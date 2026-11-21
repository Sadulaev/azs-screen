import fs from 'fs';
import path from 'path';
import { defaultConfig } from './defaultConfig.js';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const configPath = path.join(dataDir, 'config.json');
const uploadsDir = path.join(dataDir, 'uploads');

function ensureDirs() {
  fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(configPath)) {
    const initial = { ...defaultConfig, updatedAt: new Date().toISOString() };
    fs.writeFileSync(configPath, JSON.stringify(initial, null, 2), 'utf8');
  }
}

export function initStore() {
  ensureDirs();
}

export function getConfig() {
  ensureDirs();
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(raw);
  return {
    ...defaultConfig,
    ...config,
    logoUrl: config.logoUrl || '',
    backgroundUrl: config.backgroundUrl || '',
  };
}

export function saveConfig(next) {
  ensureDirs();
  const payload = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(configPath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

export function getUploadsDir() {
  ensureDirs();
  return uploadsDir;
}

export { dataDir };
