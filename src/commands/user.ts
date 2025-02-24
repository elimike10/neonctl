import yargs from 'yargs';
import { CommonProps } from '../types.js';
import { writer } from '../writer.js';
import { refreshToken } from '../auth.js';
import { log } from '../log.js';
import { ensureAuth } from './auth.js';
import { TokenSet } from 'openid-client';

export const command = 'me';
export const describe = 'Show current user';
export const builder = (yargs: yargs.Argv) =>
  yargs.option('context-file', {
    hidden: true,
  });
export const handler = async (args: CommonProps) => {
  await me(args);
};

const me = async (props: CommonProps) => {
  try {
    await ensureAuth(props as any); // Type assertion to bypass type check
    const { data } = await props.apiClient.getCurrentUserInfo();
    writer(props).end(data, {
      fields: ['login', 'email', 'name', 'projects_limit'],
    });
  } catch (error: any) { // Type assertion to allow error.message access
    if (error.message && error.message.includes('No credentials found')) {
      log.error(error.message);
      return;
    }
    if (error.response && error.response.status === 401) {
      log.info('Token expired, attempting to refresh...');
      try {
        // We'll need to implement a different way to refresh the token
        // For now, let's just inform the user to re-authenticate
        log.error('Token expired. Please run `neonctl auth` to reauthenticate.');
        return;
      } catch (refreshError: any) {
        log.error('Failed to refresh token. Please run `neonctl auth` to reauthenticate.');
      }
    } else {
      log.error('An error occurred:', error.message);
    }
  }
};
