import { type Node } from '@canvex/extension-fishbone-diagram';

export function findNodeById(root: Node, id: string): Node | undefined {
  if (root.id === id) {
    return root;
  }

  for (const child of root.children) {
    const result = findNodeById(child, id);
    if (result) {
      return result;
    }
  }

  return undefined;
}
