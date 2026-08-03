import type { ReactElement } from 'react';
import { suggestNextPatchVersion } from '../api/local-api-client.js';
import { ConfirmDialog } from '../components/confirm-dialog.js';
import { buildDeleteDescription, type CardRow } from './card-list-utils.js';

interface DeleteCardDialogProps {
  target: CardRow | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCardDialog({
  target,
  busy,
  onCancel,
  onConfirm,
}: DeleteCardDialogProps): ReactElement {
  return (
    <ConfirmDialog
      open={target !== null}
      title={target?.cardType === 'story' ? '删除一课' : '删除单词'}
      description={target ? buildDeleteDescription(target) : ''}
      confirmLabel="确认删除"
      busy={busy}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

interface CreateStoryDialogProps {
  open: boolean;
  lessonCode: string;
  busy: boolean;
  onLessonCodeChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CreateStoryDialog({
  open,
  lessonCode,
  busy,
  onLessonCodeChange,
  onCancel,
  onConfirm,
}: CreateStoryDialogProps): ReactElement {
  return (
    <ConfirmDialog
      open={open}
      title="新增一课"
      description="将创建 story_reading 模板卡（单段 + 占位时间轴 + 空 sidebar）。"
      confirmLabel="创建"
      busy={busy}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <label className="field-label">
        lessonCode
        <input
          className="input"
          type="text"
          value={lessonCode}
          onChange={(event) => {
            onLessonCodeChange(event.target.value);
          }}
        />
      </label>
    </ConfirmDialog>
  );
}

interface BuildPackDialogProps {
  open: boolean;
  packVersion: string;
  nextVersion: string;
  busy: boolean;
  onNextVersionChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BuildPackDialog({
  open,
  packVersion,
  nextVersion,
  busy,
  onNextVersionChange,
  onCancel,
  onConfirm,
}: BuildPackDialogProps): ReactElement {
  return (
    <ConfirmDialog
      open={open}
      title="打包确认"
      description={`将把 meta.packVersion 从 v${packVersion} bump 为 v${nextVersion}（默认 patch +1，可修改），然后执行 build:pack。`}
      confirmLabel="确认打包"
      busy={busy}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <label className="field-label">
        packVersion（建议 {suggestNextPatchVersion(packVersion)}）
        <input
          className="input"
          type="text"
          value={nextVersion}
          onChange={(event) => {
            onNextVersionChange(event.target.value);
          }}
        />
      </label>
    </ConfirmDialog>
  );
}
