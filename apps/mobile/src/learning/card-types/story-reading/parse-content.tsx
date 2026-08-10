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
      knowledgeId={props.knowledgeId}
      onHomePress={props.onHomePress}
      onMorePress={props.onMorePress}
      {...(props.initialAudioPositionMs !== undefined
        ? { initialAudioPositionMs: props.initialAudioPositionMs }
        : {})}
      {...(props.onNavigateLesson ? { onNavigateLesson: props.onNavigateLesson } : {})}
      {...(props.onReaderBookmark ? { onReaderBookmark: props.onReaderBookmark } : {})}
      {...(props.lessonNavigationIds ? { lessonNavigationIds: props.lessonNavigationIds } : {})}
      packId={props.packId}
    />
  );
}
