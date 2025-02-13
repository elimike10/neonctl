import yargs from 'yargs';
import { CommonProps } from '../types.js';
import { writer } from '../writer.js';
import { log } from '../log.js';

export const command = 'branches <command>';
export const desc = 'Manage branches';

export const builder = (yargs: yargs.Argv) =>
  yargs
    .command('list', 'List branches', {}, (args: any) =>
      listBranches(args as CommonProps),
    )
    .command('create', 'Create a new branch', {}, (args: any) =>
      createBranch(args as CommonProps),
    )
    .command('delete', 'Delete a branch', {}, (args: any) =>
      deleteBranch(args as CommonProps),
    )
    .demandCommand(1, 'You need at least one command before moving on');

async function listBranches(args: CommonProps & { projectId?: string }) {
  const { data } = await args.apiClient.listProjectBranches({
    projectId: args.projectId || '',
  });
  writer(args).end(data.branches, { fields: ['id', 'name', 'current_state'] });
}

async function createBranch(
  args: CommonProps & { projectId?: string; name?: string },
) {
  // Implement create branch logic
  log.info('Creating branch:', args.name);
  // Placeholder for actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function deleteBranch(
  args: CommonProps & { projectId?: string; branchId?: string },
) {
  // Implement delete branch logic
  log.info('Deleting branch:', args.branchId);
  // Placeholder for actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export const handler = (): void => {
  // This function is intentionally left empty as it's not needed for this command
};

export const BRANCH_FIELDS = ['id', 'name', 'current_state'] as const;
