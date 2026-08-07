import type { ReactElement } from 'react';
import type { StoryReadingContent } from '@remember/contracts';
import { StoryVocabPanel } from './story-vocab-panel';

interface StoryVocabTabProps {
  content: StoryReadingContent;
  packId: string;
}

export function StoryVocabTab(props: StoryVocabTabProps): ReactElement {
  return <StoryVocabPanel packId={props.packId} sidebar={props.content.sidebar} />;
}
