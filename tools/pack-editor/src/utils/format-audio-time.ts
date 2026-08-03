/** 将毫秒格式化为 M:SS 或 M:SS.t（有非整秒时显示一位小数秒）。 */
export function formatAudioTimeMs(ms: number | undefined): string {
  if (ms === undefined || Number.isNaN(ms)) {
    return '--:--';
  }

  const totalMs = Math.max(0, Math.round(ms));
  const minutes = Math.floor(totalMs / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const remainderMs = totalMs % 1000;

  if (remainderMs > 0) {
    const tenths = Math.floor(remainderMs / 100);
    return `${String(minutes)}:${String(seconds).padStart(2, '0')}.${String(tenths)}`;
  }

  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
}

/** 本段时长（秒，如 9.8秒）；终点未设置时返回 null。 */
export function formatSegmentDurationSeconds(
  startMs: number | undefined,
  endMs: number | undefined,
): string | null {
  if (
    startMs === undefined ||
    endMs === undefined ||
    Number.isNaN(startMs) ||
    Number.isNaN(endMs) ||
    endMs <= startMs
  ) {
    return null;
  }
  const seconds = (endMs - startMs) / 1000;
  return `${seconds.toFixed(1)}秒`;
}
