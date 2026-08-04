import { describe, expect, it } from 'vitest';
import { resolvePackAssetPath, resolvePackAssetWritePath, resolveSourceDir } from './paths.js';

describe('resolveSourceDir', () => {
  it('拒绝路径逃逸 packId', () => {
    const result = resolveSourceDir('../../../etc/passwd');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it('接受合法 packId', () => {
    const result = resolveSourceDir('remember-test-pack');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.path).toMatch(/remember-test-pack$/);
    }
  });
});

describe('resolvePackAssetPath', () => {
  const sourceDir = resolveSourceDir('story-test-pack');
  if (!sourceDir.ok) {
    throw new Error('expected story-test-pack fixture');
  }

  it('拒绝 ../ 路径', () => {
    const result = resolvePackAssetPath(sourceDir.path, '../etc/passwd');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it('拒绝非 assets/ 路径', () => {
    const result = resolvePackAssetPath(sourceDir.path, 'pack.sqlite');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it('接受合法 assets 路径', () => {
    const result = resolvePackAssetPath(sourceDir.path, 'assets/audio/c1.mp3');
    expect(result.ok).toBe(true);
  });
});

describe('resolvePackAssetWritePath', () => {
  const sourceDir = resolveSourceDir('story-test-pack');
  if (!sourceDir.ok) {
    throw new Error('expected story-test-pack fixture');
  }

  it('拒绝非音频扩展名', () => {
    const result = resolvePackAssetWritePath(sourceDir.path, 'assets/images/c1.png');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  it('允许写入新 mp3 路径（不要求文件已存在）', () => {
    const result = resolvePackAssetWritePath(sourceDir.path, 'assets/audio/tts-queue-test.mp3');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.relativePath).toBe('assets/audio/tts-queue-test.mp3');
    }
  });
});
