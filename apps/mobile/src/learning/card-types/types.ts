import type { ReactElement } from 'react';
import type { InspectModeChromeProps } from '../../components/calendar/inspect-mode-chrome';

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
  primaryAudioPlaying?: boolean;
  playingExampleAudioPath?: string | null;
  initialAudioPositionMs?: number;
  onReaderBookmark?: (positionMs: number) => void;
  onNavigateLesson?: (knowledgeId: string) => void;
  /** 家长检查等场景：限定上一篇/下一篇仅在给定 knowledgeId 列表内切换 */
  lessonNavigationIds?: string[];
  /** 顶栏居中副标题，如复习来源包或家长检查状态 */
  contextLabel?: string;
  /** 家长检查：贴边导航 + 横滑切词 */
  inspectNav?: InspectModeChromeProps | null;
}

export interface CardTypeDefinition {
  reviewMode: ReviewMode;
  libraryPresentation: LibraryPresentation;
  Renderer: (props: CardRendererProps) => ReactElement;
}
