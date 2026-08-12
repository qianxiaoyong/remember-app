import { beforeEach, describe, expect, it, vi } from 'vitest';

const copyAsync = vi.fn();
const getInfoAsync = vi.fn();
const requestPermissionsAsync = vi.fn();
const saveToLibraryAsync = vi.fn();

const mockAsset = {
  downloaded: true,
  localUri: 'assets_images_contact_official_qrcode',
  downloadAsync: vi.fn(),
};

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-asset', () => ({
  Asset: {
    fromModule: vi.fn(() => mockAsset),
  },
}));

vi.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  copyAsync,
  getInfoAsync,
}));

vi.mock('expo-media-library/legacy', () => ({
  requestPermissionsAsync,
  saveToLibraryAsync,
}));

vi.mock('../assets/contact-official-qrcode', () => ({
  contactOfficialQrCodeModule: 42,
}));

describe('resolveContactQrFileUri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsset.downloaded = true;
    mockAsset.localUri = 'assets_images_contact_official_qrcode';
    mockAsset.downloadAsync.mockImplementation(async () => {
      mockAsset.downloaded = true;
      mockAsset.localUri = 'file:///data/user/0/com.remember.app/cache/ExponentAsset-abc.png';
      return mockAsset;
    });
    getInfoAsync.mockResolvedValue({
      exists: false,
      isDirectory: false,
      uri: 'file:///cache/contact-official-qrcode.png',
    });
    copyAsync.mockResolvedValue(undefined);
  });

  it('resets Android bundled asset before native download', async () => {
    getInfoAsync
      .mockResolvedValueOnce({
        exists: false,
        isDirectory: false,
        uri: 'file:///cache/contact-official-qrcode.png',
      })
      .mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        uri: 'file:///cache/contact-official-qrcode.png',
        size: 1024,
        modificationTime: 0,
      });

    const { resolveContactQrFileUri } = await import('./save-contact-qr-code');
    const uri = await resolveContactQrFileUri();

    expect(mockAsset.downloaded).toBe(true);
    expect(mockAsset.downloadAsync).toHaveBeenCalled();
    expect(uri).toBe('file:///cache/contact-official-qrcode.png');
    expect(copyAsync).toHaveBeenCalledWith({
      from: 'file:///data/user/0/com.remember.app/cache/ExponentAsset-abc.png',
      to: 'file:///cache/contact-official-qrcode.png',
    });
  });

  it('reuses cached file when already present', async () => {
    getInfoAsync.mockResolvedValue({
      exists: true,
      isDirectory: false,
      uri: 'file:///cache/contact-official-qrcode.png',
      size: 1024,
      modificationTime: 0,
    });

    const { resolveContactQrFileUri } = await import('./save-contact-qr-code');
    const uri = await resolveContactQrFileUri();

    expect(uri).toBe('file:///cache/contact-official-qrcode.png');
    expect(mockAsset.downloadAsync).not.toHaveBeenCalled();
  });
});

describe('saveContactQrCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsset.downloaded = true;
    mockAsset.localUri = 'assets_images_contact_official_qrcode';
    mockAsset.downloadAsync.mockImplementation(async () => {
      mockAsset.localUri = 'file:///data/user/0/com.remember.app/cache/ExponentAsset-abc.png';
      return mockAsset;
    });
    getInfoAsync.mockResolvedValue({
      exists: true,
      isDirectory: false,
      uri: 'file:///cache/contact-official-qrcode.png',
      size: 1024,
      modificationTime: 0,
    });
    requestPermissionsAsync.mockResolvedValue({
      granted: true,
      status: 'granted',
      canAskAgain: true,
      expires: 'never',
    });
    saveToLibraryAsync.mockResolvedValue(undefined);
  });

  it('saves materialized qr file via saveToLibraryAsync', async () => {
    const { saveContactQrCode } = await import('./save-contact-qr-code');
    const result = await saveContactQrCode();

    expect(result).toBe('saved');
    expect(saveToLibraryAsync).toHaveBeenCalledWith('file:///cache/contact-official-qrcode.png');
  });

  it('returns permission_denied when album permission is missing', async () => {
    requestPermissionsAsync.mockResolvedValue({
      granted: false,
      status: 'denied',
      canAskAgain: true,
      expires: 'never',
    });

    const { saveContactQrCode } = await import('./save-contact-qr-code');
    const result = await saveContactQrCode();

    expect(result).toBe('permission_denied');
    expect(saveToLibraryAsync).not.toHaveBeenCalled();
  });
});
