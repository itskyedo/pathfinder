import { action, json } from '@solidjs/router';

import { getDatabase } from '~/services/db';

export const updateNodeText = action(async (id: string, text: string) => {
  'use server';

  const db = await getDatabase();

  const result = await db
    .run(
      `
UPDATE "node"
SET "text" = ?
WHERE "id" = ?;
`,
      [text, id],
    )
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });

  return json({
    result,
  });
}, 'updateNodeText');
