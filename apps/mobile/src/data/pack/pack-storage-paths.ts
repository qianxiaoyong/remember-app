import { documentDirectory } from 'expo-file-system/legacy';

export interface PackInstallPaths {
  packDir: string;
  sqlitePath: string;
  assetsDir: string;
}

export function getPackInstallPaths(packId: string): PackInstallPaths {
  const root = documentDirectory ?? '';
  const packDir = `${root}packs/${packId}/`;
  return {
    packDir,
    sqlitePath: `${packDir}pack.sqlite`,
    assetsDir: `${packDir}assets/`,
  };
}
