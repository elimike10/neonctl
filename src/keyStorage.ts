import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const API_KEY_FILE = join(homedir(), '.neonctl_api_key');

export const storeApiKey = (apiKey: string): void => {
  writeFileSync(API_KEY_FILE, apiKey, 'utf8');
};

export const retrieveApiKey = (): string | null => {
  try {
    return readFileSync(API_KEY_FILE, 'utf8');
  } catch {
    return null;
  }
};

export const apiKeyExists = (): boolean => {
  return existsSync(API_KEY_FILE);
};
