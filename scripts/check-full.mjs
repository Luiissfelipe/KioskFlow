import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { classifyFindings, parseOsvReport } from './osv-severity.ts';
import { finish, listCandidateFiles, REPO_ROOT_PATH, runCheck, runStep, TEST_DATABASE_URL } from './lib.mjs';

const SECONDS_BUDGET = 600;
const OSV_IMAGE = 'ghcr.io/google/osv-scanner:v2.7.1';
const SEMGREP_IMAGE = 'semgrep/semgrep:1.186.0';
const OSV_EXIT_CODES_WITH_REPORT = new Set([0, 1]);
const REPO_MOUNT = REPO_ROOT_PATH.replace(/[\\/]+$/, '');
const NEXT_TELEMETRY_OFF = { NEXT_TELEMETRY_DISABLED: '1' };

function withTempDirectory(prefix, action) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  try {
    return action(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function printFindings(label, findings) {
  for (const { packageName, version, ids, severity } of findings) {
    console.log(`  ${label}: ${packageName}@${version} ${ids.join(', ')} (severity ${severity ?? 'unknown'})`);
  }
}

function checkDependencyVulnerabilities() {
  return withTempDirectory('kioskflow-osv-', (outputDirectory) => {
    const scan = spawnSync(
      'docker',
      [
        'run', '--rm',
        '-v', `${REPO_MOUNT}:/src:ro`,
        '-v', `${outputDirectory}:/out`,
        OSV_IMAGE,
        'scan', 'source', '-L', '/src/pnpm-lock.yaml', '--format', 'json', '--output-file', '/out/osv.json',
      ],
      { stdio: 'inherit' },
    );
    if (!OSV_EXIT_CODES_WITH_REPORT.has(scan.status)) {
      console.log(`osv-scanner failed with exit code ${scan.status}`);
      return false;
    }
    const { blocking, warnings } = classifyFindings(parseOsvReport(readFileSync(join(outputDirectory, 'osv.json'), 'utf8')));
    printFindings('warning', warnings);
    printFindings('BLOCKING', blocking);
    return blocking.length === 0;
  });
}

function copyProjectFiles(targetDirectory) {
  for (const file of listCandidateFiles()) {
    const target = join(targetDirectory, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(REPO_ROOT_PATH, file), target);
  }
}

function checkStaticAnalysis() {
  return withTempDirectory('kioskflow-semgrep-', (sourceDirectory) => {
    copyProjectFiles(sourceDirectory);
    const scan = spawnSync(
      'docker',
      [
        'run', '--rm',
        '-v', `${sourceDirectory}:/src:ro`,
        '-w', '/src',
        SEMGREP_IMAGE,
        'semgrep', 'scan',
        '--config', 'p/typescript', '--config', 'p/owasp-top-ten',
        '--severity', 'ERROR', '--error', '--metrics=off', '--disable-version-check', '--quiet', '.',
      ],
      { stdio: 'inherit' },
    );
    return scan.status === 0;
  });
}

finish(
  'check:full',
  [
    runStep('postgres for integration tests', 'docker compose up -d --wait db'),
    runStep('tsc --noEmit', 'pnpm typecheck'),
    runStep('eslint (whole repo)', 'pnpm lint'),
    runStep('production build', 'pnpm build', NEXT_TELEMETRY_OFF),
    runStep('tests with coverage floors (unit and integration)', 'pnpm exec vitest run --config vitest.full.config.mjs --coverage', {
      TEST_DATABASE_URL,
    }),
    runStep('architecture boundaries', 'pnpm depcruise'),
    runStep('gitleaks (git history)', 'gitleaks git --redact --no-banner --log-level warn .'),
    runCheck('dependency vulnerabilities (osv-scanner)', checkDependencyVulnerabilities),
    runCheck('static analysis (semgrep)', checkStaticAnalysis),
  ],
  SECONDS_BUDGET,
);
