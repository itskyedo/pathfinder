import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';

import { seedDatabase } from '~/services/db';

export async function GET({ params }: APIEvent) {
  const result = await seedDatabase()
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });

  return json({
    result,
  });
}
