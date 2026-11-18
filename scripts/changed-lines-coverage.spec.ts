import {
  calculateChangedLinesCoverage,
  parseChangedLines,
  parseLcov,
  toRepoRelativePath,
} from './changed-lines-coverage';

describe('parseChangedLines', () => {
  it('collects the added line numbers of a hunk', () => {
    const diff = ['diff --git a/src/a.ts b/src/a.ts', '--- a/src/a.ts', '+++ b/src/a.ts', '@@ -4,0 +5,3 @@'].join('\n');

    const changed = parseChangedLines(diff);

    expect(changed.get('src/a.ts')).toEqual(new Set([5, 6, 7]));
  });

  it('treats a hunk without a count as a single line', () => {
    const diff = ['--- a/src/a.ts', '+++ b/src/a.ts', '@@ -9 +9 @@'].join('\n');

    const changed = parseChangedLines(diff);

    expect(changed.get('src/a.ts')).toEqual(new Set([9]));
  });

  it('ignores hunks that only delete lines', () => {
    const diff = ['--- a/src/a.ts', '+++ b/src/a.ts', '@@ -3,2 +2,0 @@'].join('\n');

    const changed = parseChangedLines(diff);

    expect(changed.get('src/a.ts')).toEqual(new Set());
  });

  it('merges several hunks of the same file and keeps files apart', () => {
    const diff = [
      '--- a/src/a.ts',
      '+++ b/src/a.ts',
      '@@ -1,0 +2,1 @@',
      '@@ -10,0 +12,2 @@',
      '--- a/src/b.ts',
      '+++ b/src/b.ts',
      '@@ -1 +1 @@',
    ].join('\n');

    const changed = parseChangedLines(diff);

    expect(changed).toEqual(
      new Map([
        ['src/a.ts', new Set([2, 12, 13])],
        ['src/b.ts', new Set([1])],
      ]),
    );
  });

  it('ignores files that were deleted', () => {
    const diff = ['--- a/src/gone.ts', '+++ /dev/null', '@@ -1,4 +0,0 @@'].join('\n');

    const changed = parseChangedLines(diff);

    expect(changed.size).toBe(0);
  });
});

describe('parseLcov', () => {
  it('reads the hit count of every line per file', () => {
    const report = ['TN:', 'SF:src/a.ts', 'DA:1,3', 'DA:2,0', 'end_of_record', 'SF:src/b.ts', 'DA:7,1', 'end_of_record'].join('\n');

    const hits = parseLcov(report);

    expect(hits).toEqual(
      new Map([
        ['src/a.ts', new Map([[1, 3], [2, 0]])],
        ['src/b.ts', new Map([[7, 1]])],
      ]),
    );
  });

  it('ignores records that are not line hits', () => {
    const report = ['SF:src/a.ts', 'FN:1,run', 'FNDA:1,run', 'BRDA:1,0,0,1', 'DA:1,1', 'LF:1', 'LH:1', 'end_of_record'].join('\n');

    const hits = parseLcov(report);

    expect(hits.get('src/a.ts')).toEqual(new Map([[1, 1]]));
  });
});

describe('toRepoRelativePath', () => {
  it('turns a windows absolute path into a repo-relative path with forward slashes', () => {
    const relative = toRepoRelativePath('C:\\work\\repo\\packages\\shared\\src\\cpf.ts', 'C:\\work\\repo');

    expect(relative).toBe('packages/shared/src/cpf.ts');
  });

  it('keeps a path that is already relative', () => {
    const relative = toRepoRelativePath('packages/shared/src/cpf.ts', 'C:\\work\\repo');

    expect(relative).toBe('packages/shared/src/cpf.ts');
  });
});

describe('calculateChangedLinesCoverage', () => {
  it('counts only changed lines that are executable', () => {
    const changed = new Map([['src/a.ts', new Set([1, 2, 3, 4])]]);
    const hits = new Map([['src/a.ts', new Map([[1, 1], [3, 0]])]]);

    const result = calculateChangedLinesCoverage(changed, hits);

    expect(result).toMatchObject({ covered: 1, total: 2, percentage: 50 });
  });

  it('lists the uncovered changed lines per file', () => {
    const changed = new Map([['src/a.ts', new Set([1, 2, 3])]]);
    const hits = new Map([['src/a.ts', new Map([[1, 0], [2, 4], [3, 0]])]]);

    const result = calculateChangedLinesCoverage(changed, hits);

    expect(result.uncoveredByFile).toEqual(new Map([['src/a.ts', [1, 3]]]));
  });

  it('ignores changed files that are absent from the coverage report', () => {
    const changed = new Map([['README.md', new Set([1, 2])]]);
    const hits = new Map([['src/a.ts', new Map([[1, 1]])]]);

    const result = calculateChangedLinesCoverage(changed, hits);

    expect(result).toMatchObject({ covered: 0, total: 0 });
  });

  it('reports full coverage when no changed line is executable', () => {
    const changed = new Map([['src/a.ts', new Set([5])]]);
    const hits = new Map([['src/a.ts', new Map([[1, 1]])]]);

    const result = calculateChangedLinesCoverage(changed, hits);

    expect(result.percentage).toBe(100);
  });
});
