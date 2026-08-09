import { Asset } from 'expo-asset';
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';
import { Platform } from 'react-native';

const PLAYBACK_STATUS_UPDATE = 'playbackStatusUpdate';
const PLAYBACK_WAIT_MS = 3000;

let sharedPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let audioModeConfigured = false;
let activePlaybackToken = 0;

export async function ensureExpoAudioMode(): Promise<void> {
  await ensureAudioMode();
}

export async function resolveExpoAudioPlaybackUri(uri: string): Promise<string> {
  return resolveUriForPlayback(uri);
}

export interface ExpoAudioPositionState {
  positionMs: number;
  durationMs: number;
  playing: boolean;
}

export type ExpoAudioPositionListener = (state: ExpoAudioPositionState) => void;

const positionListeners = new Set<ExpoAudioPositionListener>();
let positionListenerAttached = false;

function readPlayerPositionState(): ExpoAudioPositionState {
  if (!sharedPlayer) {
    return { positionMs: 0, durationMs: 0, playing: false };
  }
  const status = sharedPlayer.currentStatus;
  const currentTimeSeconds =
    'currentTime' in status && typeof status.currentTime === 'number' ? status.currentTime : 0;
  return {
    positionMs: Math.max(0, Math.round(currentTimeSeconds * 1000)),
    durationMs: Math.max(0, Math.round(sharedPlayer.duration * 1000)),
    playing: sharedPlayer.playing,
  };
}

function notifyPositionListeners(): void {
  const state = readPlayerPositionState();
  for (const listener of positionListeners) {
    listener(state);
  }
}

function attachPositionListener(): void {
  if (positionListenerAttached || !sharedPlayer) {
    return;
  }
  sharedPlayer.addListener(PLAYBACK_STATUS_UPDATE, () => {
    notifyPositionListeners();
  });
  positionListenerAttached = true;
}

export function subscribeExpoAudioPosition(listener: ExpoAudioPositionListener): () => void {
  positionListeners.add(listener);
  attachPositionListener();
  listener(readPlayerPositionState());
  return () => {
    positionListeners.delete(listener);
  };
}

export function getSharedExpoAudioPlayer(): ReturnType<typeof createAudioPlayer> | null {
  return sharedPlayer;
}

export async function prepareExpoAudioUri(uri: string): Promise<'loaded' | 'failed'> {
  try {
    await ensureAudioMode();
    const playbackUri = await resolveUriForPlayback(uri);
    if (!sharedPlayer) {
      sharedPlayer = createAudioPlayer({ uri: playbackUri }, { updateInterval: 100 });
      positionListenerAttached = false;
      attachPositionListener();
    } else {
      sharedPlayer.replace({ uri: playbackUri });
      await sharedPlayer.seekTo(0);
    }
    const ready = await waitForPlayback(sharedPlayer);
    notifyPositionListeners();
    return ready === 'ready' ? 'loaded' : 'failed';
  } catch {
    return 'failed';
  }
}

export function playPreparedExpoAudio(): void {
  sharedPlayer?.play();
}

export function pausePreparedExpoAudio(): void {
  sharedPlayer?.pause();
}

export async function seekPreparedExpoAudio(positionMs: number): Promise<void> {
  if (!sharedPlayer) {
    return;
  }
  await sharedPlayer.seekTo(positionMs / 1000);
  notifyPositionListeners();
}

export function setPreparedExpoAudioPlaybackRate(rate: number): void {
  if (!sharedPlayer) {
    return;
  }
  if (Platform.OS === 'android') {
    sharedPlayer.shouldCorrectPitch = true;
    sharedPlayer.setPlaybackRate(rate);
    return;
  }
  sharedPlayer.setPlaybackRate(rate, 'high');
}

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
      positionListenerAttached = false;
      attachPositionListener();
    } else {
      sharedPlayer.replace({ uri: playbackUri });
      await sharedPlayer.seekTo(0);
    }

    sharedPlayer.play();
    const ready = await waitForPlayback(sharedPlayer);
    notifyPositionListeners();
    return ready === 'ready' ? 'played' : 'failed';
  } catch {
    return 'failed';
  }
}

export function cancelExpoAudioPlayback(): void {
  activePlaybackToken += 1;
  sharedPlayer?.pause();
  notifyPositionListeners();
}

export async function playExpoAudioUriRepeated(
  uri: string,
  times: number,
  token: number,
): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    if (token !== activePlaybackToken) {
      return;
    }
    const result = await playExpoAudioUri(uri);
    if (result !== 'played' || token !== activePlaybackToken) {
      return;
    }
    const finished = await waitForPlaybackFinished(token);
    if (!finished) {
      return;
    }
  }
}

export function beginPrimaryAudioPlayback(): number {
  activePlaybackToken += 1;
  return activePlaybackToken;
}

export function getActivePlaybackToken(): number {
  return activePlaybackToken;
}

function waitForPlaybackFinished(token: number): Promise<boolean> {
  if (!sharedPlayer) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      resolve(token === activePlaybackToken);
    }, 30000);

    const subscription = sharedPlayer!.addListener(PLAYBACK_STATUS_UPDATE, (status) => {
      if (token !== activePlaybackToken) {
        clearTimeout(timeout);
        subscription.remove();
        resolve(false);
        return;
      }
      if (status.error) {
        clearTimeout(timeout);
        subscription.remove();
        resolve(false);
        return;
      }
      if (status.isLoaded && !status.playing && status.currentTime > 0) {
        clearTimeout(timeout);
        subscription.remove();
        resolve(true);
      }
    });
  });
}

/** 测试专用：重置播放器单例。 */
export function resetExpoAudioPlayerForTests(): void {
  sharedPlayer?.remove();
  sharedPlayer = null;
  audioModeConfigured = false;
  activePlaybackToken = 0;
  positionListeners.clear();
  positionListenerAttached = false;
}
