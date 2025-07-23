import { json, query } from '@solidjs/router';

import { type DiagramData, getDatabase } from '~/services/db';

export const getDiagrams = query(async () => {
  'use server';

  const db = await getDatabase();

  const diagrams = await db.all<DiagramData[]>(
    'SELECT "id", "name", "description", "created_at", "updated_at" FROM diagram',
  );

  return json({
    result: diagrams,
  });
}, 'diagrams');
