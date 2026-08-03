import type { StoryRun } from '@remember/contracts';
import type { ReactElement } from 'react';
import { buildPreviewSegments } from '../utils/story-runs-markup.js';

interface StoryParagraphPreviewProps {
  runs: StoryRun[];
}

export function StoryParagraphPreview({ runs }: StoryParagraphPreviewProps): ReactElement {
  const segments = buildPreviewSegments(runs);

  return (
    <p className="edit-story-paragraph-preview">
      {segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <span key={index}>{segment.text}</span>;
        }
        if (segment.tier === 'normal') {
          return (
            <span key={index} className="edit-story-word-normal" title={segment.vocabId}>
              {segment.text}
            </span>
          );
        }
        return (
          <span
            key={index}
            className={`edit-story-word edit-story-word-${segment.tier ?? 'high'}`}
            title={segment.vocabId}
          >
            {segment.text}
          </span>
        );
      })}
    </p>
  );
}
