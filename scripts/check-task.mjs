import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import {
  calculateChangedLinesCoverage,
  parseChangedLines,
  parseLcov,
  toRepoRelativePath,
} from './changed-lines-coverage.ts';
import { finish, listChangedFiles, readWorkingTreeDiff, REPO_ROOT_PATH, runCheck, runStep } from './lib.mjs';

const SECONDS_BUDGET = 90;
const CHANGED_LINES_FLOOR_PERCENTAGE = 80;
const LCOV_REPORT = join(REPO_ROOT_PATH, 'coverage', 'lcov.info');
const UNIT_TESTS_COMMAND = 'pnpm exec vitest run --coverage';

function readCoverageHits() {
  const hits = parseLcov(readFileSync(LCOV_REPORT, 'utf8'));
  return new Map([...hits].map(([file, lines]) => [toRepoRelativePath(file, REPO_ROOT_PATH), lines]));
}

function collectChangedLines(hits) {
  const changed = new Map(parseChangedLines(readWorkingTreeDiff()));
  for (const file of listChangedFiles().untracked) {
    changed.set(file, new Set(hits.get(file)?.keys()));
  }
  return changed;
}

function printUncoveredLines(uncoveredByFile) {
  for (const [file, lines] of uncoveredByFile) {
    console.log(`  not covered: ${file}: ${lines.join(', ')}`);
  }
}

function checkChangedLinesCoverage() {
  if (!existsSync(LCOV_REPORT)) {
    console.log('coverage/lcov.info was not produced, so changed lines cannot be measured');
    return false;
  }
  const hits = readCoverageHits();
  const { covered, total, percentage, uncoveredByFile } = calculateChangedLinesCoverage(collectChangedLines(hits), hits);
  console.log(`  changed executable lines covered: ${covered}/${total} (${percentage.toFixed(1)}%), floor ${CHANGED_LINES_FLOOR_PERCENTAGE}%`);
  printUncoveredLines(uncoveredByFile);
  return percentage >= CHANGED_LINES_FLOOR_PERCENTAGE;
}

rmSync(LCOV_REPORT, { force: true });

finish(
  'check:task',
  [
    runStep('unit tests with coverage floors', UNIT_TESTS_COMMAND),
    runCheck('coverage of changed lines', checkChangedLinesCoverage),
    runStep('architecture boundaries', 'pnpm depcruise'),
  ],
  SECONDS_BUDGET,
);
