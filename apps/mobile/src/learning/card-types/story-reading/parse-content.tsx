import type { StoryReadingContent } from '@remember/contracts';
import type { CardRendererProps } from '../types';
import { StoryLessonShell } from './story-lesson-shell';

export function parseStoryReadingContent(content: unknown): StoryReadingContent {
  return content as StoryReadingContent;
}

export function StoryReadingCardRenderer(props: CardRendererProps) {
  return (
    <StoryLessonShell
      content={parseStoryReadingContent(props.content)}
      initialAudioPositionMs={props.initialAudioPositionMs}
      knowledgeId={props.knowledgeId}
      onHomePress={props.onHomePress}
      onMorePress={props.onMorePress}
      {...(props.onNavigateLesson ? { onNavigateLesson: props.onNavigateLesson } : {})}
      {...(props.onReaderBookmark ? { onReaderBookmark: props.onReaderBookmark } : {})}
      packId={props.packId}
    />
  );
}
