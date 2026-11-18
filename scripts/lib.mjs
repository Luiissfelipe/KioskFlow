import { spawnSync } from 'node:child_process';

const REPO_ROOT = new URL('..', import.meta.url);
const GIT_OPTIONS = ['-c', 'core.quotepath=off'];

function readOutput(command, args) {
  const result = spawnSync(command, args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stderr}`);
  }
  return result.stdout;
}

function readLines(command, args) {
  return readOutput(command, args).split('\n').filter(Boolean);
}

export function listChangedFiles() {
  return {
    tracked: readLines('git', [...GIT_OPTIONS, 'diff', '--name-only', '--diff-filter=ACMR', 'HEAD']),
    untracked: readLines('git', [...GIT_OPTIONS, 'ls-files', '--others', '--exclude-standard']),
  };
}

function elapsedSeconds(startedAt) {
  return (performance.now() - startedAt) / 1000;
}

export function runStep(label, commandLine) {
  console.log(`\n▶ ${label}`);
  const startedAt = performance.now();
  const { status } = spawnSync(commandLine, { cwd: REPO_ROOT, stdio: 'inherit', shell: true });
  return { label, passed: status === 0, seconds: elapsedSeconds(startedAt) };
}

export function finish(name, results, secondsBudget) {
  const totalSeconds = results.reduce((sum, result) => sum + result.seconds, 0);
  console.log(`\n${name} summary`);
  for (const { label, passed, seconds } of results) {
    console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${label}  (${seconds.toFixed(1)}s)`);
  }
  console.log(`  total ${totalSeconds.toFixed(1)}s (budget ${secondsBudget}s)`);
  process.exit(results.every((result) => result.passed) ? 0 : 1);
}
