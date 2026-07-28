import { parseCardContentJson, type VocabularyContent } from '@remember/contracts';
import { openDatabaseSync } from 'expo-sqlite';

export interface PackCardDetail {
  knowledgeId: string;
  sortOrder: number;
  headword: string;
  content: VocabularyContent;
}

export function getPackCardDetail(sqlitePath: string, knowledgeId: string): PackCardDetail | null {
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

  const content = parseCardContentJson(row.content);
  return {
    knowledgeId: row.knowledgeId,
    sortOrder: row.sortOrder,
    headword: content.prompt.headword,
    content,
  };
}

export function listPackCardDetails(sqlitePath: string): PackCardDetail[] {
  const db = openDatabaseSync(sqlitePath);
  db.execSync('PRAGMA query_only = ON');
  const rows = db.getAllSync<{
    knowledgeId: string;
    sortOrder: number;
    content: string;
  }>('SELECT knowledgeId, sortOrder, content FROM cards ORDER BY sortOrder ASC');
  db.closeSync();

  return rows.map((row) => {
    const content = parseCardContentJson(row.content);
    return {
      knowledgeId: row.knowledgeId,
      sortOrder: row.sortOrder,
      headword: content.prompt.headword,
      content,
    };
  });
}

export function searchPackCardsByHeadword(sqlitePath: string, query: string): PackCardDetail[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return listPackCardDetails(sqlitePath).filter((card) =>
    card.headword.toLowerCase().includes(normalizedQuery),
  );
}
