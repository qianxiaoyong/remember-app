import { adminPackSummarySchema, includedHighlightSchema } from '@remember/contracts';
import type { AdminPackListRecord } from './admin-packs.repository.js';

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function parseIncludedHighlights(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => includedHighlightSchema.parse(item));
}

export function toAdminPackSummary(
  pack: AdminPackListRecord,
  current?: { packVersion: string; protocolVersion: number },
) {
  const includedHighlights = parseIncludedHighlights(pack.includedHighlights);
  const coverLines = parseStringArray(pack.coverLines);
  const samplePreviewsRaw = Array.isArray(pack.samplePreviews) ? pack.samplePreviews : [];
  const introMediaRaw = Array.isArray(pack.introMedia) ? pack.introMedia : undefined;

  return adminPackSummarySchema.parse({
    packId: pack.packId,
    title: pack.title,
    ...(pack.displayTitle ? { displayTitle: pack.displayTitle } : {}),
    primaryCategory: pack.primaryCategory,
    secondaryCategory: pack.secondaryCategory,
    versionLabel: pack.versionLabel,
    ...(pack.primaryNodeId ? { primaryNodeId: pack.primaryNodeId } : {}),
    ...(pack.secondaryNodeId ? { secondaryNodeId: pack.secondaryNodeId } : {}),
    ...(pack.versionNodeId ? { versionNodeId: pack.versionNodeId } : {}),
    contentTags: parseStringArray(pack.contentTags),
    cardCount: pack.cardCount,
    sizeLabel: pack.sizeLabel,
    summary: pack.summary,
    priceCents: pack.priceCents,
    ...(pack.coverUrl ? { coverUrl: pack.coverUrl } : {}),
    ...(pack.coverThumbnailUrl ? { coverThumbnailUrl: pack.coverThumbnailUrl } : {}),
    ...(pack.coverBadge ? { coverBadge: pack.coverBadge } : {}),
    ...(coverLines.length > 0 ? { coverLines } : {}),
    ...(includedHighlights.length > 0 ? { includedHighlights } : {}),
    ...(samplePreviewsRaw.length > 0 ? { samplePreviews: samplePreviewsRaw } : {}),
    ...(introMediaRaw && introMediaRaw.length > 0 ? { introMedia: introMediaRaw } : {}),
    status: pack.status,
    ...(pack.currentVersionId ? { currentVersionId: pack.currentVersionId } : {}),
    ...(current ? { currentPackVersion: current.packVersion } : {}),
    ...(current ? { protocolVersion: current.protocolVersion } : {}),
    updatedAt: pack.updatedAt.toISOString(),
  });
}

export function toAdminPackVersion(
  version: {
    id: string;
    packId: string;
    packVersion: string;
    sha256: string;
    sizeBytes: bigint;
    keyId: string;
    protocolVersion: number;
    status: string;
    publishedAt: Date;
    note: string | null;
  },
  isCurrent: boolean,
) {
  return {
    id: version.id,
    packId: version.packId,
    packVersion: version.packVersion,
    sha256: version.sha256,
    sizeBytes: Number(version.sizeBytes),
    keyId: version.keyId,
    protocolVersion: version.protocolVersion,
    status: version.status,
    publishedAt: version.publishedAt.toISOString(),
    isCurrent,
    ...(version.note ? { note: version.note } : {}),
  };
}
