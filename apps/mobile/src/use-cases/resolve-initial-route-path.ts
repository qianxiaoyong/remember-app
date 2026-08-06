/** 冷启动一律进入首页（我的知识库），不在启动时跳转学习页。 */
export function resolveInitialRoutePath(): string {
  return '/library';
}
