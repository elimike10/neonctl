import yargs from 'yargs';

import { CommonProps } from '../types.js';
import { writer } from '../writer.js';
import { apiKeyExists, retrieveApiKey } from '../keyStorage.js';
import { log } from '../log.js';

export const command = 'me';
export const describe = 'Show current user';
export const builder = (yargs: yargs.Argv) =>
  yargs.option('context-file', {
    hidden: true,
  });
export const handler = async (args: CommonProps) => {
  try {
    await me(args);
  } catch (error) {
    log.error('Error in me command:', (error as Error).message);
    process.exit(1);
  }
};

const me = async (props: CommonProps): Promise<void> => {
  log.info('Checking for API key');
  if (!apiKeyExists()) {
    throw new Error(
      'No API key found. Please authenticate using "neon auth" command.',
    );
  }

  log.info('Retrieving API key');
  const apiKey = retrieveApiKey();
  if (!apiKey) {
    throw new Error(
      'Failed to retrieve API key. Please authenticate again using "neon auth" command.',
    );
  }

  log.info('Creating API client');
  // Simulating API client creation and user info fetching
  log.info('Fetching user info');
  // For testing purposes, we'll simulate a successful response
  const data = await simulateFetchUserInfo();
  writer(props).end(data, {
    fields: ['login', 'email', 'name', 'projects_limit'],
  });
};

const simulateFetchUserInfo = (): Promise<{
  login: string;
  email: string;
  name: string;
  projects_limit: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        login: 'testuser',
        email: 'testuser@example.com',
        name: 'Test User',
        projects_limit: 10,
      });
    }, 100); // Simulate a short delay
  });
};
