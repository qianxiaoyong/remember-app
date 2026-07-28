import { z } from 'zod';
import { MANIFEST_VERSION, PROTOCOL_VERSION } from './constants.js';
import { assertAllowedPackPath } from './paths.js';

export const packManifestFileSchema = z
  .object({
    path: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sizeBytes: z.number().int().nonnegative(),
  })
  .strict();

export const packManifestSectionSchema = z
  .object({
    title: z.string().min(1),
    cardType: z.string().min(1),
    sortOrderStart: z.number().int().nonnegative(),
    sortOrderEnd: z.number().int().nonnegative(),
    entryGuide: z.string().min(1).optional(),
  })
  .strict();

export const packManifestBaseSchema = z
  .object({
    manifestVersion: z.literal(MANIFEST_VERSION),
    protocolVersion: z.literal(PROTOCOL_VERSION),
    packId: z.string().min(1),
    packVersion: z.string().min(1),
    keyId: z.string().min(1),
    files: z.array(packManifestFileSchema).min(1),
    signature: z.string().min(1),
    sections: z.array(packManifestSectionSchema).optional(),
  })
  .strict();

export const packManifestForSigningSchema = packManifestBaseSchema.omit({ signature: true });

export const packManifestSchema = packManifestBaseSchema.superRefine((manifest, ctx) => {
  const paths = manifest.files.map((file) => file.path);
  const uniquePaths = new Set(paths);
  if (uniquePaths.size !== paths.length) {
    ctx.addIssue({ code: 'custom', message: 'duplicate file paths in manifest' });
  }

  let hasSqlite = false;
  for (const file of manifest.files) {
    try {
      assertAllowedPackPath(file.path);
    } catch {
      ctx.addIssue({ code: 'custom', message: `illegal file path: ${file.path}` });
    }
    if (file.path === 'pack.sqlite') {
      hasSqlite = true;
    }
  }

  if (!hasSqlite) {
    ctx.addIssue({ code: 'custom', message: 'manifest must include pack.sqlite' });
  }
});

export type PackManifest = z.infer<typeof packManifestSchema>;
export type PackManifestFile = z.infer<typeof packManifestFileSchema>;

export type PackManifestForSigning = z.infer<typeof packManifestForSigningSchema>;
