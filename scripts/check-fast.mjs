import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { finish, listCandidateFiles, listChangedFiles, REPO_ROOT_PATH, runCheck, runStep } from './lib.mjs';

const LINTABLE_FILE = /\.(ts|tsx|js|mjs|cjs)$/;
const SECONDS_BUDGET = 15;
const GITLEAKS_CONFIG = join(REPO_ROOT_PATH, '.gitleaks.toml');

function changedLintableFiles() {
  const { tracked, untracked } = listChangedFiles();
  return [...new Set([...tracked, ...untracked])].filter((file) => LINTABLE_FILE.test(file));
}

function buildSteps() {
  const files = changedLintableFiles();
  const lintStep = files.length > 0
    ? [['eslint (changed files)', `pnpm exec eslint --max-warnings 0 ${files.map((file) => `"${file}"`).join(' ')}`]]
    : [];
  return [['tsc --noEmit --incremental', 'pnpm typecheck'], ...lintStep];
}

function withTempDirectory(prefix, action) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  try {
    return action(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function copyCommittableFiles(targetDirectory) {
  for (const file of listCandidateFiles()) {
    const target = join(targetDirectory, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(REPO_ROOT_PATH, file), target);
  }
}

function scanCommittableFilesForSecrets() {
  return withTempDirectory('kioskflow-gitleaks-', (sourceDirectory) => {
    copyCommittableFiles(sourceDirectory);
    const scan = spawnSync(
      'gitleaks',
      ['dir', '--redact', '--no-banner', '--log-level', 'warn', '--config', GITLEAKS_CONFIG, sourceDirectory],
      { stdio: 'inherit' },
    );
    if (scan.error) {
      console.log(`gitleaks could not run: ${scan.error.message}`);
    }
    return scan.status === 0;
  });
}

finish(
  'check:fast',
  [
    ...buildSteps().map(([label, commandLine]) => runStep(label, commandLine)),
    runCheck('gitleaks (committable files)', scanCommittableFilesForSecrets),
  ],
  SECONDS_BUDGET,
);
