import type { ReactElement } from 'react';
import type { StoryReadingContent } from '@remember/contracts';
import { StoryVocabPanel } from './story-vocab-panel';

interface StoryVocabTabProps {
  content: StoryReadingContent;
}

export function StoryVocabTab(props: StoryVocabTabProps): ReactElement {
  return <StoryVocabPanel sidebar={props.content.sidebar} />;
}
