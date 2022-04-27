import { execSync } from 'child_process';

interface GitCommit {
  hash: string;
  date: Date;
  message: string;
  author: {
    name: string;
    email: string;
  };
}

const GIT_COMMIT_INFO_COMMAND = 'git log -1 --format="%H|%ct|%s|%an|%ae"';
const GIT_CURRENT_BRANCH_COMMAND = 'git rev-parse --abbrev-ref HEAD';

/**
 * Retrieves the current git repository's Information (last commit and current branch)
 */
export function getGitInfo(): { commit: GitCommit; branch: string } {
  return { commit: getGitCommit(), branch: getCurrentBranch() };
}

function getGitCommit(): GitCommit {
  const [hash, ts, message, authorName, authorEmail] = execute(GIT_COMMIT_INFO_COMMAND).split('|');
  return {
    hash,
    date: new Date(Number(ts) * 1000),
    message,
    author: {
      name: authorName,
      email: authorEmail
    }
  };
}

function getCurrentBranch(): string {
  return execute(GIT_CURRENT_BRANCH_COMMAND);
}

function execute(cmd: string): string {
  return execSync(cmd).toString().trim();
}
