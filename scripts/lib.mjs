import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = new URL('..', import.meta.url);
export const REPO_ROOT_PATH = fileURLToPath(REPO_ROOT);
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

export function readWorkingTreeDiff() {
  return readOutput('git', [...GIT_OPTIONS, 'diff', '-U0', 'HEAD']);
}

export function listChangedFiles() {
  return {
    tracked: readLines('git', [...GIT_OPTIONS, 'diff', '--name-only', '--diff-filter=ACMR', 'HEAD']),
    untracked: readLines('git', [...GIT_OPTIONS, 'ls-files', '--others', '--exclude-standard']),
  };
}

export function listCandidateFiles() {
  const tracked = readLines('git', [...GIT_OPTIONS, 'ls-files']);
  const untracked = readLines('git', [...GIT_OPTIONS, 'ls-files', '--others', '--exclude-standard']);
  return [...new Set([...tracked, ...untracked])].filter((file) => existsSync(join(REPO_ROOT_PATH, file)));
}

function elapsedSeconds(startedAt) {
  return (performance.now() - startedAt) / 1000;
}

export function runStep(label, commandLine, env = {}) {
  console.log(`\n▶ ${label}`);
  const startedAt = performance.now();
  const { status } = spawnSync(commandLine, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  });
  return { label, passed: status === 0, seconds: elapsedSeconds(startedAt) };
}

export function runCheck(label, check) {
  console.log(`\n▶ ${label}`);
  const startedAt = performance.now();
  const passed = check();
  return { label, passed, seconds: elapsedSeconds(startedAt) };
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
