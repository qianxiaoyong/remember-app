import { useState, type ReactElement, type ReactNode } from 'react';
import { synthesizeTts } from '../api/tts-api-client.js';

interface TtsSynthesizeButtonProps {
  packId: string;
  text: string;
  relativePath: string;
  onPathGenerated: (relativePath: string) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function TtsSynthesizeButton({
  packId,
  text,
  relativePath,
  onPathGenerated,
  disabled = false,
  children = 'TTS',
}: TtsSynthesizeButtonProps): ReactElement {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="tts-synthesize-inline">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={disabled || busy || text.trim().length === 0}
        title={relativePath}
        onClick={() => {
          void (async () => {
            setBusy(true);
            setError(null);
            try {
              const result = await synthesizeTts({
                packId,
                text: text.trim(),
                relativePath,
                label: text.trim().slice(0, 48),
              });
              onPathGenerated(result.relativePath);
            } catch (synthError: unknown) {
              const message = synthError instanceof Error ? synthError.message : String(synthError);
              setError(message);
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        {busy ? '合成中…' : children}
      </button>
      {error && <span className="field-error">{error}</span>}
    </span>
  );
}
