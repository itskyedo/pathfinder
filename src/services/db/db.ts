import fs from 'node:fs';
import path from 'node:path';

import { open } from 'sqlite';
import sqlite from 'sqlite3';

export const DB_MEMORY_URL = ':memory:';

export type DatabaseConnection = Awaited<ReturnType<typeof open>>;

let db: DatabaseConnection;
let connectionAttempt: Promise<DatabaseConnection> | undefined;

export async function getDatabase(): Promise<DatabaseConnection> {
  if (db) {
    return db;
  } else if (connectionAttempt) {
    return connectionAttempt;
  } else {
    connectionAttempt = new Promise<DatabaseConnection>((resolve, reject) => {
      const databaseUrl = getDatabaseUrl() || DB_MEMORY_URL;
      if (databaseUrl === DB_MEMORY_URL) {
        console.warn(
          'Database file not found, defaulting to an in-memory database. Changes will be lost when server is closed.',
        );
      }

      open({ filename: databaseUrl, driver: sqlite.Database })
        .then((database) => {
          db = database;
          connectionAttempt = undefined;

          database
            .exec('PRAGMA foreign_keys = ON;')
            .then(() => resolve(database))
            .catch((error) => {
              connectionAttempt = undefined;
              console.error(error);
              reject(Error('Failed to connect to the database'));
            });
        })
        .catch((error) => {
          connectionAttempt = undefined;
          console.error(error);

          reject(Error('Failed to connect to the database'));
        });
    });

    return connectionAttempt;
  }
}

export function getDatabaseUrl(): string | undefined {
  try {
    const url = path.join(process.cwd(), './database.db');
    if (fs.existsSync(url)) {
      return url;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}
