export const USER_DB_VERSION = 2;

export const USER_DB_TABLE_NAMES = [
  'installed_packs',
  'learning_states',
  'study_sessions',
  'study_queue_items',
  'sync_outbox',
  'saved_lexicon_items',
] as const;

export type UserDbTableName = (typeof USER_DB_TABLE_NAMES)[number];

export const MIGRATION_V1_SQL: readonly string[] = [
  `CREATE TABLE installed_packs (
    packId TEXT NOT NULL PRIMARY KEY,
    displayName TEXT NOT NULL,
    packVersion TEXT NOT NULL,
    sqlitePath TEXT NOT NULL,
    assetsDir TEXT NOT NULL,
    installStatus TEXT NOT NULL CHECK(installStatus IN ('installing', 'installed', 'failed')),
    installedAt TEXT NOT NULL,
    lastOpenedAt TEXT
  )`,
  `CREATE TABLE learning_states (
    knowledgeId TEXT NOT NULL PRIMARY KEY,
    packId TEXT NOT NULL,
    easiness REAL NOT NULL DEFAULT 2.5,
    intervalDays INTEGER NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    dueAt TEXT NOT NULL,
    clientVersion INTEGER NOT NULL DEFAULT 0,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX idx_learning_states_pack_id ON learning_states (packId)`,
  `CREATE INDEX idx_learning_states_due_at ON learning_states (dueAt)`,
  `CREATE TABLE study_sessions (
    sessionId TEXT NOT NULL PRIMARY KEY,
    packId TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'completed')),
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX idx_study_sessions_pack_id ON study_sessions (packId)`,
  `CREATE TABLE study_queue_items (
    itemId TEXT NOT NULL PRIMARY KEY,
    sessionId TEXT NOT NULL,
    knowledgeId TEXT NOT NULL,
    itemType TEXT NOT NULL CHECK(itemType IN ('new', 'review', 'relearn')),
    sortOrder INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'done')),
    FOREIGN KEY (sessionId) REFERENCES study_sessions (sessionId),
    UNIQUE (sessionId, sortOrder)
  )`,
  `CREATE INDEX idx_study_queue_items_session_id ON study_queue_items (sessionId)`,
  `CREATE TABLE sync_outbox (
    eventId TEXT NOT NULL PRIMARY KEY,
    knowledgeId TEXT NOT NULL,
    clientVersion INTEGER NOT NULL,
    payload TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`,
  `CREATE INDEX idx_sync_outbox_knowledge_id ON sync_outbox (knowledgeId)`,
];

export const MIGRATION_V2_SQL: readonly string[] = [
  `CREATE TABLE saved_lexicon_items (
    packId TEXT NOT NULL,
    surfaceForm TEXT NOT NULL,
    savedAt TEXT NOT NULL,
    PRIMARY KEY (packId, surfaceForm)
  )`,
  `CREATE INDEX idx_saved_lexicon_items_pack_id ON saved_lexicon_items (packId)`,
];

export const MIGRATIONS: Readonly<Record<number, readonly string[]>> = {
  1: MIGRATION_V1_SQL,
  2: MIGRATION_V2_SQL,
};
