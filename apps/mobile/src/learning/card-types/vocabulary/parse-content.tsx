import type { VocabularyContent } from '@remember/contracts';
import type { CardRendererProps } from '../types';
import { VocabularyStudyPanel } from './vocabulary-study-panel';

export function parseVocabularyContent(content: unknown): VocabularyContent {
  return content as VocabularyContent;
}

export function VocabularyCardRenderer(props: CardRendererProps) {
  return (
    <VocabularyStudyPanel
      content={parseVocabularyContent(props.content)}
      lexiconSelectedSurfaceForm={props.lexiconSelectedSurfaceForm}
      onHomePress={props.onHomePress}
      onMorePress={props.onMorePress}
      onPlayExampleAudio={props.onPlayExampleAudio}
      onPlayPrimaryAudio={props.onPlayPrimaryAudio}
      onReveal={() => {
        props.setRevealed(true);
      }}
      onTokenPress={props.onTokenPress}
      revealed={props.revealed}
    />
  );
}
