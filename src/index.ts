import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getApiClient } from './api.js';
import { log } from './log.js';
import { ensureAuth } from './commands/auth.js';
import {
  analyticsMiddleware,
  sendError,
  getAnalyticsEventProperties,
  closeAnalytics,
} from './analytics.js';
import { CommonProps } from './types.js';

// Import commands
import * as authCommand from './commands/auth.js';
import * as branchesCommand from './commands/branches.js';
import * as connectionStringCommand from './commands/connection_string.js';
import * as databasesCommand from './commands/databases.js';
import * as ipAllowCommand from './commands/ip_allow.js';
import * as operationsCommand from './commands/operations.js';
import * as orgsCommand from './commands/orgs.js';
import * as projectsCommand from './commands/projects.js';
import * as rolesCommand from './commands/roles.js';
import * as schemaDiffCommand from './commands/schema_diff.js';
import * as setContextCommand from './commands/set_context.js';
import * as userCommand from './commands/user.js';
import * as vpcEndpointsCommand from './commands/vpc_endpoints.js';

const cli = yargs(hideBin(process.argv))
  .option('output', {
    choices: ['yaml', 'json', 'table'] as const,
    default: 'table' as const,
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
  .middleware(analyticsMiddleware as any)
  .middleware(async (args: any) => {
    const apiKey = await ensureAuth(args as CommonProps);
    args.apiClient = getApiClient({ apiKey, apiHost: args.apiHost });
    return args;
  })
  .command(authCommand as any)
  .command(branchesCommand as any)
  .command(connectionStringCommand as any)
  .command(databasesCommand as any)
  .command(ipAllowCommand as any)
  .command(operationsCommand as any)
  .command(orgsCommand as any)
  .command(projectsCommand as any)
  .command(rolesCommand as any)
  .command(schemaDiffCommand as any)
  .command(setContextCommand as any)
  .command(userCommand as any)
  .command(vpcEndpointsCommand as any)
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .alias({ h: 'help' })
  .wrap(72)
  .epilogue('for more information, find our manual at https://neon.tech')
  .fail((msg, err) => {
    if (err) {
      if (err.name === 'TimeoutError') {
        sendError(err);
        log.error('Request timed out. Please try again.');
      } else if (err.message?.includes('401')) {
        sendError(err);
        log.error('Authentication failed. Please run  to reauthenticate.');
      } else if (err.message?.includes('403')) {
        sendError(err);
        log.error(
          'Access denied. Please check your permissions and try again.',
        );
      } else if (err.message?.includes('429')) {
        sendError(err);
        log.error('Too many requests. Please try again later.');
      } else {
        sendError(err);
        log.error(err.message);
      }
    } else {
      sendError(new Error(msg));
      log.error(msg);
    }
    log.info('\nFor more information, run with --help');
    process.exit(1);
  });

const runCLI = async () => {
  try {
    const args = await cli.parse();
    await closeAnalytics();
    const eventProperties = getAnalyticsEventProperties(
      args as unknown as CommonProps,
    );
    log.debug('Analytics event properties:', eventProperties);
  } catch (err) {
    log.error('Unhandled error:', err);
    process.exit(1);
  }
};

void runCLI();
