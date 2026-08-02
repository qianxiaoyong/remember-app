import { openDatabaseSync } from 'expo-sqlite';

export interface PackCardSummary {
  knowledgeId: string;
  sortOrder: number;
  headword: string;
}

export function listPackCards(sqlitePath: string): PackCardSummary[] {
  const db = openDatabaseSync(sqlitePath);
  db.execSync('PRAGMA query_only = ON');
  const rows = db.getAllSync<{
    knowledgeId: string;
    sortOrder: number;
    content: string;
  }>('SELECT knowledgeId, sortOrder, content FROM cards ORDER BY sortOrder ASC');

  const cards: PackCardSummary[] = [];
  for (const row of rows) {
    const content = JSON.parse(row.content) as {
      prompt?: { headword?: string };
      lesson?: { titleEn?: string };
    };
    cards.push({
      knowledgeId: row.knowledgeId,
      sortOrder: row.sortOrder,
      headword: content.prompt?.headword ?? content.lesson?.titleEn ?? row.knowledgeId,
    });
  }

  db.closeSync();
  return cards;
}

export function getPackCard(sqlitePath: string, knowledgeId: string): PackCardSummary | null {
  const db = openDatabaseSync(sqlitePath);
  db.execSync('PRAGMA query_only = ON');
  const row = db.getFirstSync<{
    knowledgeId: string;
    sortOrder: number;
    content: string;
  }>('SELECT knowledgeId, sortOrder, content FROM cards WHERE knowledgeId = ?', [knowledgeId]);

  db.closeSync();
  if (!row) {
    return null;
  }

  const content = JSON.parse(row.content) as {
    prompt?: { headword?: string };
    lesson?: { titleEn?: string };
  };
  return {
    knowledgeId: row.knowledgeId,
    sortOrder: row.sortOrder,
    headword: content.prompt?.headword ?? content.lesson?.titleEn ?? row.knowledgeId,
  };
}
