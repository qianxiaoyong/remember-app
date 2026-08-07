import { deletePackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { deleteStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { resolvePackLibraryPresentation } from './resolve-pack-library-presentation';

export function resetPackBrowseProgress(input: { packId: string }): void {
  const installed = getInstalledPack(input.packId);
  if (!installed) {
    throw new Error('学习包未安装');
  }

  const isReader = resolvePackLibraryPresentation(input.packId) === 'reader';
  const db = openUserDatabase();
  if (isReader) {
    deleteStoryReadingBookmark(input.packId, db);
  } else {
    deletePackBrowseBookmark(input.packId, db);
  }
}
