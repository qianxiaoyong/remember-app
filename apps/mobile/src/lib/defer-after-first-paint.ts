/** 在首帧绘制完成后再执行，避免与 splash / layout 争抢 JS 线程。 */
export function deferAfterFirstPaint(callback: () => void): () => void {
  let cancelled = false;
  const frameId = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!cancelled) {
        callback();
      }
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(frameId);
  };
}
