/** Returns true when `left` is strictly older than `right` (semver-like x.y.z). */
export function isPackVersionOlder(left: string, right: string): boolean {
  const leftParts = left.split('.').map((part) => Number.parseInt(part, 10));
  const rightParts = right.split('.').map((part) => Number.parseInt(part, 10));
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue < rightValue) {
      return true;
    }
    if (leftValue > rightValue) {
      return false;
    }
  }
  return false;
}
