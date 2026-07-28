/** 递归键排序 canonical JSON，用于 manifest 签名与验签 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
  return `{${entries.join(',')}}`;
}

export function manifestBytesForSigning(
  manifestWithoutSignature: Record<string, unknown>,
): Uint8Array {
  return new TextEncoder().encode(canonicalJson(manifestWithoutSignature));
}
