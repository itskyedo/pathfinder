import { type Node } from '@canvex/extension-fishbone-diagram';

import { type Point, isPointInBBox } from './geometry';

export function findNodeAtPoint(root: Node, point: Point): Node | undefined {
  if (isPointInBBox(point, root)) {
    return root;
  } else if (isPointInBBox(point, root.outer)) {
    for (const child of root.children) {
      if (isPointInBBox(point, child.outer)) {
        return findNodeAtPoint(child, point);
      }
    }
  }

  return undefined;
}
