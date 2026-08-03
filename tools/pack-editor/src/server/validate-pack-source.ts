import { vocabularyContentSchema } from '@remember/contracts';
import { readPackSource, isStorySourceCard } from '@remember/pack-builder/pack-source';
import { validateStorySourceCard } from './story-source-validation.js';

export interface ValidationIssue {
  sortOrder?: number;
  path: string;
  message: string;
}

export function validatePackSource(sourceDir: string): ValidationIssue[] {
  const source = readPackSource(sourceDir);
  const issues: ValidationIssue[] = [];

  for (const card of source.cards) {
    if (isStorySourceCard(card)) {
      issues.push(...validateStorySourceCard(sourceDir, card));
      continue;
    }

    const parsed = vocabularyContentSchema.safeParse(card.content);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push({
          sortOrder: card.sortOrder,
          path: issue.path.join('.'),
          message: issue.message,
        });
      }
    }

    const audioPath = card.content.prompt.primaryAudio;
    if (audioPath && !existsSync(join(sourceDir, audioPath))) {
      issues.push({
        sortOrder: card.sortOrder,
        path: 'prompt.primaryAudio',
        message: `资源不存在: ${audioPath}`,
      });
    }

    for (const [index, example] of card.content.reveal.examples.entries()) {
      if (example.audio && !existsSync(join(sourceDir, example.audio))) {
        issues.push({
          sortOrder: card.sortOrder,
          path: `reveal.examples[${String(index)}].audio`,
          message: `资源不存在: ${example.audio}`,
        });
      }
    }

    if (
      card.content.prompt.primaryImage &&
      !existsSync(join(sourceDir, card.content.prompt.primaryImage))
    ) {
      issues.push({
        sortOrder: card.sortOrder,
        path: 'prompt.primaryImage',
        message: `资源不存在: ${card.content.prompt.primaryImage}`,
      });
    }
  }

  return issues;
}
