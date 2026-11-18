const FRAMEWORK_PACKAGES = '(^|node_modules/)(@nestjs/|@prisma/client|stripe($|/)|socket\\.io|@socket\\.io/)';
const GENERATED_PRISMA_CLIENT = '^apps/api/generated/';

module.exports = {
  forbidden: [
    {
      name: 'domain-must-not-import-frameworks',
      severity: 'error',
      from: { path: '^(apps/api/src/.+/domain/|packages/shared/src/)' },
      to: { path: [FRAMEWORK_PACKAGES, GENERATED_PRISMA_CLIENT] },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules', GENERATED_PRISMA_CLIENT] },
    exclude: { path: '(^|/)(dist|coverage|\\.next|build)/' },
    tsPreCompilationDeps: true,
  },
};
