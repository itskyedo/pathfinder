import { action, json } from '@solidjs/router';

import { getDatabase } from '~/services/db';

export const deleteNode = action(async (id: string) => {
  'use server';

  const db = await getDatabase();

  const result = await db
    .run(
      `
DELETE FROM "node"
WHERE "id" = ?;
`,
      id,
    )
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });

  return json({
    result,
  });
}, 'deleteNode');
