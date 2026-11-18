export type ChangedLines = ReadonlyMap<string, ReadonlySet<number>>;
export type LineHits = ReadonlyMap<string, ReadonlyMap<number, number>>;

export interface ChangedLinesCoverage {
  readonly covered: number;
  readonly total: number;
  readonly percentage: number;
  readonly uncoveredByFile: ReadonlyMap<string, readonly number[]>;
}

const FILE_HEADER = /^\+\+\+ (?:b\/)?(.+)$/;
const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;
const LINE_HIT = /^DA:(\d+),(\d+)/;
const DELETED_FILE = '/dev/null';
const FULL_COVERAGE_PERCENTAGE = 100;
const NEW_LINE = /\r?\n/;

function lineRange(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, offset) => start + offset);
}

function openFile(changed: Map<string, Set<number>>, path: string): Set<number> | undefined {
  if (path === DELETED_FILE) {
    return undefined;
  }
  const lines = changed.get(path) ?? new Set<number>();
  changed.set(path, lines);
  return lines;
}

export function parseChangedLines(diff: string): ChangedLines {
  const changed = new Map<string, Set<number>>();
  let currentFile: Set<number> | undefined;
  let previousLine = '';
  for (const line of diff.split(NEW_LINE)) {
    const fileHeader = previousLine.startsWith('--- ') ? FILE_HEADER.exec(line) : null;
    const hunkHeader = HUNK_HEADER.exec(line);
    if (fileHeader) {
      currentFile = openFile(changed, fileHeader[1] ?? DELETED_FILE);
    } else if (hunkHeader && currentFile) {
      const [, startText = '0', countText = '1'] = hunkHeader;
      lineRange(Number(startText), Number(countText)).forEach((lineNumber) => currentFile?.add(lineNumber));
    }
    previousLine = line;
  }
  return changed;
}

export function parseLcov(report: string): LineHits {
  const hits = new Map<string, Map<number, number>>();
  let currentFile: Map<number, number> | undefined;
  for (const line of report.split(NEW_LINE)) {
    const lineHit = LINE_HIT.exec(line);
    if (line.startsWith('SF:')) {
      currentFile = new Map<number, number>();
      hits.set(line.slice('SF:'.length), currentFile);
    } else if (lineHit && currentFile) {
      const [, lineText = '0', hitText = '0'] = lineHit;
      currentFile.set(Number(lineText), Number(hitText));
    }
  }
  return hits;
}

export function toRepoRelativePath(path: string, repoRoot: string): string {
  const normalizedPath = path.replaceAll('\\', '/');
  const rootPrefix = `${repoRoot.replaceAll('\\', '/').replace(/\/$/, '')}/`;
  const insideRepo = normalizedPath.toLowerCase().startsWith(rootPrefix.toLowerCase());
  return insideRepo ? normalizedPath.slice(rootPrefix.length) : normalizedPath;
}

export function calculateChangedLinesCoverage(changed: ChangedLines, hits: LineHits): ChangedLinesCoverage {
  const uncoveredByFile = new Map<string, number[]>();
  let covered = 0;
  let total = 0;
  for (const [file, lines] of changed) {
    const fileHits = hits.get(file);
    if (!fileHits) {
      continue;
    }
    const executable = [...lines].filter((line) => fileHits.has(line)).sort((first, second) => first - second);
    const uncovered = executable.filter((line) => fileHits.get(line) === 0);
    total += executable.length;
    covered += executable.length - uncovered.length;
    if (uncovered.length > 0) {
      uncoveredByFile.set(file, uncovered);
    }
  }
  const percentage = total === 0 ? FULL_COVERAGE_PERCENTAGE : (covered / total) * FULL_COVERAGE_PERCENTAGE;
  return { covered, total, percentage, uncoveredByFile };
}
