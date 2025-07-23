import { getDatabase } from './db';

export async function seedDatabase() {
  const db = await getDatabase();
  await db.exec(
    `
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS "diagram";
CREATE TABLE "diagram" (
  "id" varchar NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS "node";
CREATE TABLE "node" (
  "id" varchar NOT NULL,
  "diagram_id" varchar NOT NULL REFERENCES "diagram"("id") ON DELETE CASCADE,
  "parent_id" varchar REFERENCES "node"("id") ON DELETE CASCADE,
  "type" varchar NOT NULL,
  "order" integer NOT NULL,
  "text" text NOT NULL,
  "attributes" text NOT NULL DEFAULT '{}',
  "description" text,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO "diagram" ("id", "name", "description")
VALUES
  ("4cbf602a-3079-4165-96b9-20b617ba036e", "Diagram 1", "Sample diagram"),
  ("0895656c-0086-4587-a9cf-9898e27ea55d", "Diagram 2", "Sample diagram");

INSERT INTO "node" ("id", "diagram_id", "parent_id", "type", "text", "order", "attributes")
VALUES
  ("df01d721-3fa2-492a-b841-e7d7829496ee", "4cbf602a-3079-4165-96b9-20b617ba036e", null, "Effect", "Effect", 0, "{}"),
  ("67d965ee-2267-435c-863d-25d87b988c09", "4cbf602a-3079-4165-96b9-20b617ba036e", "df01d721-3fa2-492a-b841-e7d7829496ee", "Category", "Category A", 0, '{ "direction": "top" }'),
  ("ee2dbf84-d824-4a5c-ae60-b543cadb7b81", "4cbf602a-3079-4165-96b9-20b617ba036e", "df01d721-3fa2-492a-b841-e7d7829496ee", "Category", "Category B", 1, '{ "direction": "top" }'),
  ("c25a99b9-d585-4d8b-bb78-ea694afa1583", "4cbf602a-3079-4165-96b9-20b617ba036e", "df01d721-3fa2-492a-b841-e7d7829496ee", "Category", "Category C", 2, '{ "direction": "bottom" }'),
  ("2297c685-4a65-40ba-ac6f-f063813561a3", "4cbf602a-3079-4165-96b9-20b617ba036e", "67d965ee-2267-435c-863d-25d87b988c09", "Cause", "Cause A.1", 0, "{}"),
  ("89d0efaf-d934-460d-8edd-0b20d0020217", "4cbf602a-3079-4165-96b9-20b617ba036e", "67d965ee-2267-435c-863d-25d87b988c09", "Cause", "Cause A.2", 0, "{}"),
  ("14893571-941d-4e07-8af6-e6fca19d1b33", "4cbf602a-3079-4165-96b9-20b617ba036e", "89d0efaf-d934-460d-8edd-0b20d0020217", "Cause", "Cause A.2.1", 0, "{}"),
  ("7ccb139a-b619-4f91-9a1a-4f778f251cf8", "4cbf602a-3079-4165-96b9-20b617ba036e", "89d0efaf-d934-460d-8edd-0b20d0020217", "Cause", "Cause A.2.2", 1, "{}"),
  ("75ff2f9d-1cd1-4eca-ad6b-e288e86c7a4e", "4cbf602a-3079-4165-96b9-20b617ba036e", "67d965ee-2267-435c-863d-25d87b988c09", "Cause", "Cause A.3", 0, "{}");

INSERT INTO "node" ("id", "diagram_id", "parent_id", "type", "text", "order")
VALUES
  ("9755333c-30e7-4727-b6a6-2042562f738f", "0895656c-0086-4587-a9cf-9898e27ea55d", null, "Effect", "Effect", 0);
  `,
  );
}
