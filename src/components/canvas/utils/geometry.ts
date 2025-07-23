/**
 * A point in two-dimensional space.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A rectangle shape object.
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A bounding box object.
 */
export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Checks if a point is inside a rect.
 *
 * @param point - The point.
 * @param rect - The rect.
 * @param options - The options.
 * @returns - `true` if the point is inside the rect, `false` otherwise.
 */
export function isPointInRect(
  point: Point,
  rect: Rect,
  options?: {
    ignoreX?: boolean;
    ignoreY?: boolean;
  },
): boolean {
  const intersectsX = options?.ignoreX
    ? true
    : point.x >= rect.x && point.x <= rect.x + rect.width;
  const intersectsY = options?.ignoreY
    ? true
    : point.y >= rect.y && point.y <= rect.y + rect.height;

  return intersectsX && intersectsY;
}

/**
 * Checks if a point is inside a bbox.
 *
 * @param point - The point.
 * @param bbox - The bbox.
 * @param options - The options.
 * @returns - `true` if the point is inside the bbox, `false` otherwise.
 */
export function isPointInBBox(
  point: Point,
  bbox: BBox,
  options?: {
    ignoreX?: boolean;
    ignoreY?: boolean;
  },
): boolean {
  const intersectsX = options?.ignoreX
    ? true
    : point.x >= bbox.x1 && point.x <= bbox.x2;
  const intersectsY = options?.ignoreY
    ? true
    : point.y >= bbox.y1 && point.y <= bbox.y2;

  return intersectsX && intersectsY;
}
