import { z } from 'zod';

export interface VulnerabilityFinding {
  readonly packageName: string;
  readonly version: string;
  readonly ids: readonly string[];
  readonly severity: number | undefined;
}

export interface VulnerabilityReport {
  readonly blocking: readonly VulnerabilityFinding[];
  readonly warnings: readonly VulnerabilityFinding[];
}

const BLOCKING_SEVERITY = 7;

const osvReportSchema = z.object({
  results: z
    .array(
      z.object({
        packages: z
          .array(
            z.object({
              package: z.object({ name: z.string(), version: z.string() }),
              groups: z.array(z.object({ ids: z.array(z.string()), max_severity: z.string().optional() })).default([]),
              vulnerabilities: z.array(z.object({ id: z.string() })).default([]),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
});

type OsvPackage = z.infer<typeof osvReportSchema>['results'][number]['packages'][number];

function parseSeverity(text: string | undefined): number | undefined {
  const severity = Number.parseFloat(text ?? '');
  return Number.isNaN(severity) ? undefined : severity;
}

function findingsOfPackage({ package: { name, version }, groups, vulnerabilities }: OsvPackage): VulnerabilityFinding[] {
  if (groups.length === 0) {
    return [{ packageName: name, version, ids: vulnerabilities.map(({ id }) => id), severity: undefined }];
  }
  return groups.map((group) => ({
    packageName: name,
    version,
    ids: group.ids,
    severity: parseSeverity(group.max_severity),
  }));
}

export function parseOsvReport(json: string): VulnerabilityFinding[] {
  const report = osvReportSchema.parse(JSON.parse(json));
  return report.results.flatMap((result) => result.packages.flatMap(findingsOfPackage));
}

export function classifyFindings(findings: readonly VulnerabilityFinding[]): VulnerabilityReport {
  const isBlocking = ({ severity }: VulnerabilityFinding) => severity === undefined || severity >= BLOCKING_SEVERITY;
  return { blocking: findings.filter(isBlocking), warnings: findings.filter((finding) => !isBlocking(finding)) };
}
