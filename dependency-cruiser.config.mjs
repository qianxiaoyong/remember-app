export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'mobile-does-not-read-other-apps',
      severity: 'error',
      from: { path: '^apps/mobile' },
      to: { path: '^apps/(api|admin)' },
    },
    {
      name: 'api-does-not-read-other-apps',
      severity: 'error',
      from: { path: '^apps/api' },
      to: { path: '^apps/(mobile|admin)' },
    },
    {
      name: 'packages-do-not-read-apps',
      severity: 'error',
      from: { path: '^packages' },
      to: { path: '^apps' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: '(^|/)(dist|coverage|node_modules|android|ios)/',
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
