import { classifyFindings, parseOsvReport, type VulnerabilityFinding } from './osv-severity';

function reportWith(packages: readonly unknown[]): string {
  return JSON.stringify({ results: [{ packages }] });
}

function finding(severity: number | undefined): VulnerabilityFinding {
  return { packageName: 'glob', version: '10.5.0', ids: ['GHSA-3g3m-2fjr-6pw4'], severity };
}

describe('parseOsvReport', () => {
  it('reads package, version, ids and numeric severity from a group', () => {
    const json = reportWith([
      {
        package: { name: 'glob', version: '10.5.0' },
        groups: [{ ids: ['GHSA-3g3m-2fjr-6pw4'], max_severity: '6.3' }],
      },
    ]);

    const findings = parseOsvReport(json);

    expect(findings).toEqual([finding(6.3)]);
  });

  it('returns no findings for a report without results', () => {
    const findings = parseOsvReport(JSON.stringify({}));

    expect(findings).toEqual([]);
  });

  it('keeps the severity unknown when the group has none or it is empty', () => {
    const json = reportWith([
      {
        package: { name: 'glob', version: '10.5.0' },
        groups: [{ ids: ['GHSA-3g3m-2fjr-6pw4'], max_severity: '' }],
      },
    ]);

    const findings = parseOsvReport(json);

    expect(findings).toEqual([finding(undefined)]);
  });

  it('falls back to the vulnerability ids when a package has no groups', () => {
    const json = reportWith([
      { package: { name: 'glob', version: '10.5.0' }, vulnerabilities: [{ id: 'GHSA-3g3m-2fjr-6pw4' }] },
    ]);

    const findings = parseOsvReport(json);

    expect(findings).toEqual([finding(undefined)]);
  });

  it('rejects a report that is not valid json', () => {
    const parse = () => parseOsvReport('not json');

    expect(parse).toThrow();
  });

  it('rejects a report whose packages have the wrong shape', () => {
    const parse = () => parseOsvReport(reportWith([{ package: { name: 42 } }]));

    expect(parse).toThrow();
  });
});

describe('classifyFindings', () => {
  it('blocks severity 7.0 and above', () => {
    const report = classifyFindings([finding(7), finding(9.8)]);

    expect(report.blocking).toHaveLength(2);
  });

  it('only warns below 7.0', () => {
    const report = classifyFindings([finding(6.9), finding(0.1)]);

    expect(report).toMatchObject({ blocking: [], warnings: [finding(6.9), finding(0.1)] });
  });

  it('blocks when the severity is unknown', () => {
    const report = classifyFindings([finding(undefined)]);

    expect(report.blocking).toEqual([finding(undefined)]);
  });
});
