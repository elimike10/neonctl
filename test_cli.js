import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getApiClient } from './src/api.js';
import { log } from './src/log.js';
import { ensureAuth } from './src/commands/auth.js';
import { analyticsMiddleware, sendError, getAnalyticsEventProperties, closeAnalytics } from './src/analytics.js';
import { CommonProps } from './src/types.js';

// Import commands
import * as userCommand from './src/commands/user.js';

async function runCLI() {
  try {
    const args = await yargs(hideBin(process.argv))
      .option('output', {
        choices: ['yaml', 'json', 'table'],
        default: 'table',
        description: 'Output format',
      })
      .option('api-host', {
        type: 'string',
        default: 'https://console.neon.tech/api/v2',
        description: 'API host',
      })
      .option('config-dir', {
        type: 'string',
        description: 'Configuration directory',
      })
      .option('force-auth', {
        type: 'boolean',
        default: false,
        description: 'Force authentication',
      })
      .middleware(analyticsMiddleware)
      .middleware(async (args) => {
        const apiKey = await ensureAuth(args);
        args.apiClient = getApiClient({ apiKey, apiHost: args.apiHost });
        return args;
      })
      .command(userCommand)
      .demandCommand(1, 'You need at least one command before moving on')
      .strict()
      .parse();

    const eventProperties = getAnalyticsEventProperties(args);
    log.debug('Analytics event properties:', eventProperties);

    await closeAnalytics();
  } catch (err) {
    console.error('Unhandled error:', err);
    process.exit(1);
  }
}

runCLI();
