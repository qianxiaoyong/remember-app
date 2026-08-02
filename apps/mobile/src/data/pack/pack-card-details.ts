import { parsePackCardContent, type ParsedPackCardContent } from '@remember/contracts';
import { openDatabaseSync } from 'expo-sqlite';

export interface PackCardRow {
  knowledgeId: string;
  cardType: string;
  sortOrder: number;
  content: string;
}

export type PackCardDetail = ParsedPackCardContent & {
  knowledgeId: string;
  sortOrder: number;
  headword: string;
};

function resolveHeadword(parsed: ParsedPackCardContent): string {
  if (parsed.cardType === 'vocabulary') {
    return parsed.content.prompt.headword;
  }
  return parsed.content.lesson.titleEn;
}

export function mapCardRowToDetail(row: PackCardRow): PackCardDetail | null {
  try {
    const parsed = parsePackCardContent(row.cardType, row.content);
    return {
      ...parsed,
      knowledgeId: row.knowledgeId,
      sortOrder: row.sortOrder,
      headword: resolveHeadword(parsed),
    };
  } catch {
    return null;
  }
}

export function getPackCardDetail(sqlitePath: string, knowledgeId: string): PackCardDetail | null {
  const db = openDatabaseSync(sqlitePath);
  db.execSync('PRAGMA query_only = ON');
  const row = db.getFirstSync<PackCardRow>(
    'SELECT knowledgeId, cardType, sortOrder, content FROM cards WHERE knowledgeId = ?',
    [knowledgeId],
  );

  db.closeSync();
  if (!row) {
    return null;
  }

  return mapCardRowToDetail(row);
}

export function listPackCardDetails(sqlitePath: string): PackCardDetail[] {
  const db = openDatabaseSync(sqlitePath);
  db.execSync('PRAGMA query_only = ON');
  const rows = db.getAllSync<PackCardRow>(
    'SELECT knowledgeId, cardType, sortOrder, content FROM cards ORDER BY sortOrder ASC',
  );
  db.closeSync();

  return rows
    .map((row) => mapCardRowToDetail(row))
    .filter((detail): detail is PackCardDetail => detail !== null);
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
