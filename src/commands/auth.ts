import yargs from 'yargs';
import { CommonProps } from '../types.js';
import { auth } from '../auth.js';
import { log } from '../log.js';
import { apiKeyExists, storeApiKey } from '../keyStorage.js';

export const command = 'auth';
export const describe = 'Authenticate with Neon';
export const builder = (yargs: yargs.Argv) => yargs;

export const handler = async (args: CommonProps) => {
  try {
    log.info('Starting authentication process...');
    const tokenSet = await auth({
      oauthHost: args.apiHost || 'https://oauth2.neon.tech',
      clientId: 'neonctl',
    });
    if (tokenSet?.access_token) {
      storeApiKey(tokenSet.access_token);
      log.info('Authentication successful. API key stored.');
    } else {
      log.error('Authentication failed. No access token received.');
    }
  } catch (error) {
    log.error('Authentication failed:', error);
  }
};

export const ensureAuth = async (args: CommonProps): Promise<string> => {
  if (!apiKeyExists()) {
    log.info('No API key found. Initiating authentication...');
    await handler(args);
  }

  if (!apiKeyExists()) {
    throw new Error(
      'Failed to authenticate. Please try again using "neon auth" command.',
    );
  }

  return 'API key exists';
};
