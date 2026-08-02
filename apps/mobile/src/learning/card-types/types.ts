import type { ReactElement } from 'react';

export type ReviewMode = 'sm2' | 'lesson_complete' | 'none' | 'interactive';

export interface CardRendererProps {
  packId: string;
  knowledgeId: string;
  sortOrder: number;
  content: unknown;
  revealed: boolean;
  setRevealed: (value: boolean) => void;
  lexiconSelectedSurfaceForm: string | null;
  onHomePress: () => void;
  onMorePress: () => void;
  onPlayPrimaryAudio: () => void;
  onPlayExampleAudio: (relativePath: string) => void;
  onTokenPress: (token: string) => void;
  onReachedBottom?: () => void;
}

export interface CardTypeDefinition {
  reviewMode: ReviewMode;
  Renderer: (props: CardRendererProps) => ReactElement;
}
