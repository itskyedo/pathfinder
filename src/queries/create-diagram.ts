import { action, json } from '@solidjs/router';
import { v4 as uuidv4 } from 'uuid';

import { getDatabase } from '~/services/db';

export const createDiagram = action(async (name: string) => {
  'use server';

  const db = await getDatabase();

  const diagramId = uuidv4();

  // We should use a transaction instead of chaining queries.

  const diagramResult = await db
    .run(
      `
INSERT INTO "diagram" ("id", "name", "description")
VALUES
  (:id, :name, :description);
`,
      {
        ':id': diagramId,
        ':name': name,
        ':description': null,
      },
    )
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });
  if (!diagramResult) {
    return json({
      result: false,
    });
  }

  await db
    .run(
      `
INSERT INTO "node" ("id", "diagram_id", "parent_id", "type", "text", "order", "attributes")
VALUES
  (:id, :diagram_id, null, "Effect", :text, 0, "{}");
`,
      {
        ':id': uuidv4(),
        ':diagram_id': diagramId,
        ':text': 'Effect',
      },
    )
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });

  return json({
    result: diagramResult,
  });
}, 'createDiagram');
