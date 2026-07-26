export function readPort(value: string | undefined): number {
  if (value === undefined) return 3000;
  if (!/^\d+$/.test(value)) throw new Error('PORT必须是1至65535之间的整数');

  const port = Number(value);
  if (port < 1 || port > 65_535) throw new Error('PORT必须是1至65535之间的整数');

  return port;
}
