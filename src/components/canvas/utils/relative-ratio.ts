/**
 * Gets the ratio of a value relative to a left and right value.
 *
 * @param value - The value to calculate.
 * @param left - The smaller value.
 * @param right - The larger value.
 * @returns - The calculated ratio.
 */
export function relativeRatio(
  value: number,
  left: number,
  right: number,
): number {
  return (value - left) / (right - left);
}
