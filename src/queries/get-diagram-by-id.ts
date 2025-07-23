import { json, query } from '@solidjs/router';

import { type DiagramData, type NodeData, getDatabase } from '~/services/db';

export const getDiagramById = query(async (id: string) => {
  'use server';

  const db = await getDatabase();

  const diagram = await db.get<DiagramData>(
    'SELECT "id", "name", "description", "created_at", "updated_at" FROM diagram WHERE id = ?',
    [id],
  );
  if (!diagram) {
    return json({ result: null });
  }

  const nodes = await db.all<NodeData[]>(
    'SELECT "id", "diagram_id", "parent_id", "type", "text", "order", "attributes" FROM node WHERE diagram_id = ?',
    [diagram.id],
  );

  return json({
    result: {
      ...diagram,
      nodes,
    },
  });
}, 'diagram');
