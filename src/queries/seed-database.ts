import { action, json } from '@solidjs/router';

import { seedDatabase as seed } from '~/services/db';

export const seedDatabase = action(async () => {
  'use server';

  const result = await seed()
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });

  return json({
    result,
  });
}, 'seedDatabase');
