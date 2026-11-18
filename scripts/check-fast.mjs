import { finish, listChangedFiles, runStep } from './lib.mjs';

const LINTABLE_FILE = /\.(ts|tsx|js|mjs|cjs)$/;
const SECONDS_BUDGET = 15;

function changedLintableFiles() {
  const { tracked, untracked } = listChangedFiles();
  return [...new Set([...tracked, ...untracked])].filter((file) => LINTABLE_FILE.test(file));
}

function buildSteps() {
  const files = changedLintableFiles();
  const lintStep = files.length > 0
    ? [['eslint (changed files)', `pnpm exec eslint --max-warnings 0 ${files.map((file) => `"${file}"`).join(' ')}`]]
    : [];
  return [
    ['tsc --noEmit --incremental', 'pnpm typecheck'],
    ...lintStep,
    ['gitleaks', 'gitleaks dir --redact --no-banner --log-level warn .'],
  ];
}

finish('check:fast', buildSteps().map(([label, commandLine]) => runStep(label, commandLine)), SECONDS_BUDGET);
