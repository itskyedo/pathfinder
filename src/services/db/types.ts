import { z } from 'zod';

export type DiagramData = z.infer<typeof DiagramData>;
export const DiagramData = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type NodeData = z.infer<typeof NodeData>;
export const NodeData = z.object({
  id: z.uuid(),
  diagramId: z.uuid(),
  parent_id: z.uuid().nullable(),
  type: z.string(),
  text: z.string(),
  order: z.number(),
  attributes: z
    .string()
    .transform((value) => JSON.parse(value) as Record<any, any>),
  created_at: z.date(),
  updated_at: z.date(),
});

export type CategoryNodeData = z.infer<typeof CategoryNodeData>;
export const CategoryNodeData = z.object({
  id: z.uuid(),
  diagram_id: z.uuid(),
  parent_id: z.uuid().nullable(),
  type: z.string(),
  text: z.string(),
  order: z.number(),
  attributes: z
    .string()
    .transform((value) => JSON.parse(value) as { direction: 'top' | 'bottom' }),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DiagramWithNodesData = z.infer<typeof DiagramWithNodesData>;
export const DiagramWithNodesData = DiagramData.extend({
  nodes: NodeData.array(),
});
