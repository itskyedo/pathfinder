/**
 * Joins non-reactive class names and strips falsey values.
 *
 * @param parts - The class names.
 * @returns - The joined class string.
 */
export function cn(
  ...parts: (string | false | null | undefined)[]
): string | undefined {
  let result: string = '';

  for (const part of parts) {
    if (part) {
      result += result ? ` ${part}` : part;
    }
  }

  return result || undefined;
}
