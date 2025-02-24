import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { TokenSet } from 'openid-client';
import yargs from 'yargs';

import { Api } from '@neondatabase/api-client';

import { auth, refreshToken } from '../auth.js';
import { log } from '../log.js';
import { getApiClient } from '../api.js';
import { isCi } from '../env.js';
import { CREDENTIALS_FILE } from '../config.js';

type AuthProps = {
  _: (string | number)[];
  configDir: string;
  oauthHost: string;
  apiHost: string;
  clientId: string;
  forceAuth: boolean;
};

export const command = 'auth';
export const aliases = ['login'];
export const describe = 'Authenticate';
export const builder = (yargs: yargs.Argv) =>
  yargs.option('context-file', {
    hidden: true,
  });
export const handler = async (args: AuthProps) => {
  await authFlow(args);
};

const isNonInteractiveEnvironment = () => {
  return isCi() || !process.stdout.isTTY;
};

export const authFlow = async ({
  configDir,
  oauthHost,
  clientId,
  apiHost,
  forceAuth,
}: AuthProps) => {
  if (!forceAuth && isNonInteractiveEnvironment()) {
    throw new Error('Cannot run interactive auth in non-interactive environment');
  }
  const tokenSet = await auth({
    oauthHost: oauthHost,
    clientId: clientId,
  });

  const credentialsPath = join(configDir, CREDENTIALS_FILE);
  await preserveCredentials(
    credentialsPath,
    tokenSet,
    getApiClient({
      apiKey: tokenSet.access_token || '',
      apiHost,
    }),
  );
  log.info('Auth complete');
  return tokenSet.access_token || '';
};

const preserveCredentials = async (
  path: string,
  credentials: TokenSet,
  apiClient: Api<unknown>,
) => {
  const {
    data: { id },
  } = await apiClient.getCurrentUserInfo();
  const contents = JSON.stringify({
    ...credentials,
    user_id: id,
  });
  writeFileSync(path, contents, {
    mode: 0o700,
  });
  log.info('Saved credentials to %s', path);
  log.debug('Credentials MD5 hash: %s', md5hash(contents));
};

export const ensureAuth = async (
  props: AuthProps & {
    apiKey: string;
    apiClient: Api<unknown>;
    help: boolean;
  },
) => {
  if (props._.length === 0 || props.help) {
    return;
  }
  if (props.apiKey || props._[0] === 'auth') {
    if (props.apiKey) {
      log.debug('using an API key to authorize requests');
    }
    props.apiClient = getApiClient({
      apiKey: props.apiKey,
      apiHost: props.apiHost,
    });
    return;
  }
  const credentialsPath = join(props.configDir, CREDENTIALS_FILE);
  if (!existsSync(credentialsPath)) {
    if (isNonInteractiveEnvironment()) {
      throw new Error('No credentials found and cannot authenticate in non-interactive environment. Please run `neonctl auth` in an interactive environment first.');
    }
    throw new Error('No credentials found. Please run `neonctl auth` to authenticate.');
  } else {
    try {
      const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
      props.apiClient = getApiClient({
        apiKey: credentials.access_token,
        apiHost: props.apiHost,
      });
    } catch (error) {
      log.error('Failed to read or parse credentials file. Please run `neonctl auth` to reauthenticate.');
      throw error;
    }
  }
};

const md5hash = (str: string) => {
  return createHash('md5').update(str).digest('hex');
};
