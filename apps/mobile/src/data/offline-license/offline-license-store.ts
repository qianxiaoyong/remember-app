import * as SecureStore from 'expo-secure-store';

function offlineLicenseKey(packId: string): string {
  return `remember.offlineLicense.${packId}`;
}

export async function writeOfflineLicenseExpiry(
  packId: string,
  expiresAtIso: string,
): Promise<void> {
  await SecureStore.setItemAsync(offlineLicenseKey(packId), expiresAtIso);
}

export async function readOfflineLicenseExpiry(packId: string): Promise<string | null> {
  return SecureStore.getItemAsync(offlineLicenseKey(packId));
}

export async function isOfflineLicenseValid(packId: string): Promise<boolean> {
  const raw = await readOfflineLicenseExpiry(packId);
  if (!raw) {
    return false;
  }
  const expiresAt = Date.parse(raw);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
