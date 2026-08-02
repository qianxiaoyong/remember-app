import type { StoryReadingContent } from '@remember/contracts';
import type { CardRendererProps } from '../types';
import { StoryReadingPanel } from './story-reading-panel';

export function parseStoryReadingContent(content: unknown): StoryReadingContent {
  return content as StoryReadingContent;
}

export function StoryReadingCardRenderer(props: CardRendererProps) {
  return (
    <StoryReadingPanel
      content={parseStoryReadingContent(props.content)}
      knowledgeId={props.knowledgeId}
      onHomePress={props.onHomePress}
      onMorePress={props.onMorePress}
      onPlayPrimaryAudio={props.onPlayPrimaryAudio}
      {...(props.onReachedBottom ? { onReachedBottom: props.onReachedBottom } : {})}
      packId={props.packId}
    />
  );
}
