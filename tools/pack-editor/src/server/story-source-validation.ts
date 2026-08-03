import { storyReadingContentSchema } from '@remember/contracts';
import type { PackSourceStoryCard } from '@remember/pack-builder/pack-source';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readAudioDurationMs } from './read-audio-duration-ms.js';
import type { ValidationIssue } from './validate-pack-source.js';
import { collectStoryContentIssues } from '../utils/story-content-issues.js';

export function validateStorySourceCard(
  sourceDir: string,
  card: PackSourceStoryCard,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const parsed = storyReadingContentSchema.safeParse(card.content);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        sortOrder: card.sortOrder,
        path: issue.path.join('.'),
        message: issue.message,
      });
    }
    return issues;
  }

  const content = parsed.data;
  const assetPaths: { path: string; field: string }[] = [
    { path: content.lesson.coverImage, field: 'lesson.coverImage' },
    { path: content.lesson.primaryAudio, field: 'lesson.primaryAudio' },
  ];

  for (const asset of assetPaths) {
    if (!existsSync(join(sourceDir, asset.path))) {
      issues.push({
        sortOrder: card.sortOrder,
        path: asset.field,
        message: `资源不存在: ${asset.path}`,
      });
    }
  }

  let primaryAudioDurationMs: number | undefined;
  const primaryAudioPath = join(sourceDir, content.lesson.primaryAudio);
  if (existsSync(primaryAudioPath)) {
    try {
      primaryAudioDurationMs = readAudioDurationMs(primaryAudioPath);
    } catch {
      issues.push({
        sortOrder: card.sortOrder,
        path: 'lesson.primaryAudio',
        message: '无法读取 primaryAudio 时长',
      });
    }
  }

  const contentIssuesOptions =
    primaryAudioDurationMs === undefined ? {} : { primaryAudioDurationMs };

  for (const issue of collectStoryContentIssues(content, contentIssuesOptions)) {
    issues.push({
      sortOrder: card.sortOrder,
      path: issue.path,
      message: issue.message,
    });
  }

  return issues;
}
