const FRAMEWORK_PACKAGES = '(^|node_modules/)(@nestjs/|@prisma/client|stripe($|/)|socket\\.io|@socket\\.io/)';
const GENERATED_PRISMA_CLIENT = '^apps/api/generated/';
const API_SOURCE = '^apps/api/src/';
const ALLOWED_MODULE_DEPENDENCIES = {
  admin: ['catalog'],
  catalog: [],
  orders: ['catalog'],
  webhooks: ['orders'],
  kitchen: ['orders'],
  board: ['orders'],
  realtime: [],
};
const INFRASTRUCTURE_FOLDERS = ['config', 'http', 'prisma', 'health'];
const PRODUCT_MODULES = Object.keys(ALLOWED_MODULE_DEPENDENCIES);

function anyFolderOf(folders) {
  return `${API_SOURCE}(${folders.join('|')})/`;
}

const moduleDirectionRules = Object.entries(ALLOWED_MODULE_DEPENDENCIES).map(([moduleName, allowedModules]) => ({
  name: `${moduleName}-dependency-direction`,
  severity: 'error',
  from: { path: anyFolderOf([moduleName]) },
  to: { path: anyFolderOf(PRODUCT_MODULES), pathNot: anyFolderOf([moduleName, ...allowedModules]) },
}));

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
    ...moduleDirectionRules,
    {
      name: 'api-folder-must-be-classified',
      severity: 'error',
      from: { path: `${API_SOURCE}[^/]+/`, pathNot: anyFolderOf([...PRODUCT_MODULES, ...INFRASTRUCTURE_FOLDERS]) },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules', GENERATED_PRISMA_CLIENT] },
    exclude: { path: '(^|/)(dist|coverage|\\.next|build)/' },
    tsPreCompilationDeps: true,
  },
};
