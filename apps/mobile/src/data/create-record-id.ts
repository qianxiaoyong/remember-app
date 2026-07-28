export function createRecordId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${String(Date.now())}-${randomPart}`;
}
