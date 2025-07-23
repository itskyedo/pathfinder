import { action, json } from '@solidjs/router';

import { getDatabase } from '~/services/db';

export const addNode = action(
  async (payload: {
    id: string;
    diagramId: string;
    parentId: string | null;
    type: string;
    text: string;
    order: number;
    attributes?: Record<any, any>;
  }) => {
    'use server';

    const db = await getDatabase();

    const result = await db
      .run(
        `
INSERT INTO "node" ("id", "diagram_id", "parent_id", "type", "text", "order", "attributes")
VALUES
  (:id, :diagram_id, :parent_id, :type, :text, :order, :attributes);
`,
        {
          ':id': payload.id,
          ':diagram_id': payload.diagramId,
          ':parent_id': payload.parentId,
          ':type': payload.type,
          ':text': payload.text,
          ':order': payload.order,
          ':attributes': payload.attributes
            ? JSON.stringify(payload.attributes)
            : '{}',
        },
      )
      .then(() => true)
      .catch((error) => {
        console.error(error);
        return false;
      });

    return json({
      result,
    });
  },
  'addNode',
);
