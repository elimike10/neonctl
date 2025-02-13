import { TokenSet } from 'openid-client';
import { log } from './log.js';
import { storeApiKey } from './keyStorage.js';

export type AuthProps = {
  oauthHost: string;
  clientId: string;
};

export const auth = ({ oauthHost, clientId }: AuthProps): Promise<TokenSet> => {
  return new Promise((resolve) => {
    log.info('Simulating authentication process for testing...');
    log.info('OAuth Host: ' + oauthHost);
    log.info('Client ID: ' + clientId);

    // Simulate a successful authentication
    const simulatedTokenSet: Partial<TokenSet> = {
      access_token: 'simulated_access_token',
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    log.info('Simulated authentication successful');
    if (simulatedTokenSet.access_token) {
      storeApiKey(simulatedTokenSet.access_token);
    }
    log.info('Simulated API key stored');

    resolve(simulatedTokenSet as TokenSet);
  });
};

export const defaultClientID = 'neonctl';
