import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { cacheDirectory, copyAsync, getInfoAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import { contactOfficialQrCodeModule } from '../assets/contact-official-qrcode';

export type SaveContactQrResult = 'saved' | 'permission_denied' | 'failed';

const CACHE_FILENAME = 'contact-official-qrcode.png';

function normalizeLocalFileUri(uri: string): string {
  if (uri.startsWith('file:///')) {
    return uri;
  }
  if (uri.startsWith('file://')) {
    return uri.replace('file://', 'file:///');
  }
  return `file://${uri.startsWith('/') ? '' : '/'}${uri}`;
}

function shouldResetAndroidBundledAsset(asset: Asset): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (asset.downloaded && asset.localUri != null && !asset.localUri.startsWith('file://')) {
    return true;
  }
  return asset.localUri != null && !asset.localUri.startsWith('file://');
}

export async function resolveContactQrFileUri(): Promise<string | null> {
  const cacheRoot = cacheDirectory;
  if (!cacheRoot) {
    return null;
  }

  const dest = `${cacheRoot}${CACHE_FILENAME}`;
  const existing = await getInfoAsync(dest);
  if (existing.exists && (existing.size ?? 0) > 0) {
    return normalizeLocalFileUri(dest);
  }

  const asset = Asset.fromModule(contactOfficialQrCodeModule);
  if (shouldResetAndroidBundledAsset(asset)) {
    asset.downloaded = false;
    asset.localUri = null;
  }

  await asset.downloadAsync();
  const sourceUri = asset.localUri;
  if (!sourceUri?.startsWith('file://')) {
    return null;
  }

  const normalizedSource = normalizeLocalFileUri(sourceUri);
  if (normalizedSource === normalizeLocalFileUri(dest)) {
    return normalizedSource;
  }

  await copyAsync({ from: normalizedSource, to: dest });
  const written = await getInfoAsync(dest);
  if (!written.exists || (written.size ?? 0) === 0) {
    return null;
  }

  return normalizeLocalFileUri(dest);
}

export async function saveContactQrCode(): Promise<SaveContactQrResult> {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
    if (!permission.granted) {
      return 'permission_denied';
    }

    const fileUri = await resolveContactQrFileUri();
    if (!fileUri) {
      return 'failed';
    }

    await MediaLibrary.saveToLibraryAsync(fileUri);
    return 'saved';
  } catch {
    return 'failed';
  }
}
