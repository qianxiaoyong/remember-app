import type { LexiconEntry, StoryReadingContent, VocabularyContent } from '@remember/contracts';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface PackSourceMeta {
  packId: string;
  packVersion: string;
  keyId: string;
}

export interface PackSourceVocabularyCard {
  kind: 'word' | 'phrase';
  sortOrder: number;
  content: VocabularyContent;
}

export interface PackSourceStoryCard {
  cardType: 'story_reading';
  sortOrder: number;
  content: StoryReadingContent;
}

export type PackSourceCard = PackSourceVocabularyCard | PackSourceStoryCard;

export function isStorySourceCard(card: PackSourceCard): card is PackSourceStoryCard {
  return 'cardType' in card && card.cardType === 'story_reading';
}

export interface PackSource {
  meta: PackSourceMeta;
  cards: PackSourceCard[];
  lexicon: LexiconEntry[];
}

function writePrettyJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function readPackSource(sourceDir: string): PackSource {
  const meta = JSON.parse(readFileSync(join(sourceDir, 'meta.json'), 'utf8')) as PackSourceMeta;
  const cards = JSON.parse(readFileSync(join(sourceDir, 'cards.json'), 'utf8')) as PackSourceCard[];
  const lexicon = JSON.parse(
    readFileSync(join(sourceDir, 'lexicon.json'), 'utf8'),
  ) as LexiconEntry[];
  return { meta, cards, lexicon };
}

export function writePackSource(sourceDir: string, source: PackSource): void {
  writePrettyJson(join(sourceDir, 'meta.json'), source.meta);
  writePrettyJson(join(sourceDir, 'cards.json'), source.cards);
  writePrettyJson(join(sourceDir, 'lexicon.json'), source.lexicon);
}

export function listPackSourceDirs(packBuilderRoot: string): string[] {
  const sourceRoot = join(packBuilderRoot, 'source');
  return readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(sourceRoot, name, 'meta.json')))
    .sort((left, right) => left.localeCompare(right));
}
