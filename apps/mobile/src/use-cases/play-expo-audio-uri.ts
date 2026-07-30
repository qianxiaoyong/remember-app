import { Asset } from 'expo-asset';
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';

const PLAYBACK_STATUS_UPDATE = 'playbackStatusUpdate';
const PLAYBACK_WAIT_MS = 3000;

let sharedPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let audioModeConfigured = false;

async function ensureAudioMode(): Promise<void> {
  if (audioModeConfigured) {
    return;
  }
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });
  await setIsAudioActiveAsync(true);
  audioModeConfigured = true;
}

async function resolveUriForPlayback(uri: string): Promise<string> {
  const asset = Asset.fromURI(uri);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}

function waitForPlayback(
  player: ReturnType<typeof createAudioPlayer>,
): Promise<'ready' | 'failed'> {
  if (player.currentStatus.error) {
    return Promise.resolve('failed');
  }
  if (player.isLoaded && player.duration > 0) {
    return Promise.resolve('ready');
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      resolve(player.isLoaded && player.duration > 0 ? 'ready' : 'failed');
    }, PLAYBACK_WAIT_MS);

    const subscription = player.addListener(PLAYBACK_STATUS_UPDATE, (status) => {
      if (status.error) {
        clearTimeout(timeout);
        subscription.remove();
        resolve('failed');
        return;
      }
      if (status.isLoaded && (status.playing || status.duration > 0)) {
        clearTimeout(timeout);
        subscription.remove();
        resolve('ready');
      }
    });
  });
}

export async function playExpoAudioUri(uri: string): Promise<'played' | 'failed'> {
  try {
    await ensureAudioMode();
    const playbackUri = await resolveUriForPlayback(uri);

    if (!sharedPlayer) {
      sharedPlayer = createAudioPlayer({ uri: playbackUri }, { updateInterval: 100 });
    } else {
      sharedPlayer.replace({ uri: playbackUri });
      await sharedPlayer.seekTo(0);
    }

    sharedPlayer.play();
    const ready = await waitForPlayback(sharedPlayer);
    return ready === 'ready' ? 'played' : 'failed';
  } catch {
    return 'failed';
  }
}

/** 测试专用：重置播放器单例。 */
export function resetExpoAudioPlayerForTests(): void {
  sharedPlayer?.remove();
  sharedPlayer = null;
  audioModeConfigured = false;
}
