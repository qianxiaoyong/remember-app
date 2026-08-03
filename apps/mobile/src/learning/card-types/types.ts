import type { ReactElement } from 'react';

export type ReviewMode = 'sm2' | 'lesson_complete' | 'none' | 'interactive';

export type LibraryPresentation = 'study' | 'reader';

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
  initialAudioPositionMs?: number;
  onReaderBookmark?: (positionMs: number) => void;
  onNavigateLesson?: (knowledgeId: string) => void;
}

export interface CardTypeDefinition {
  reviewMode: ReviewMode;
  libraryPresentation: LibraryPresentation;
  Renderer: (props: CardRendererProps) => ReactElement;
}
