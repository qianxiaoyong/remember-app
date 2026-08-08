import { BadRequestException } from '@nestjs/common';
import { CATALOG_ALL_VERSION_LABEL } from '@remember/contracts';
import type { PrismaService } from '../prisma/prisma.service.js';

export interface PackTaxonomyInput {
  primaryNodeId?: string | undefined;
  secondaryNodeId?: string | undefined;
  versionNodeId?: string | null | undefined;
  primaryCategory?: string | undefined;
  secondaryCategory?: string | undefined;
  versionLabel?: string | undefined;
}

export interface ResolvedPackTaxonomy {
  primaryNodeId: string;
  secondaryNodeId: string;
  versionNodeId: string | null;
  primaryCategory: string;
  secondaryCategory: string;
  versionLabel: string;
}

async function resolvePrimarySecondaryByNodeIds(
  prisma: PrismaService,
  primaryNodeId: string,
  secondaryNodeId: string,
) {
  const [primary, secondary] = await Promise.all([
    prisma.catalogPrimaryNode.findUnique({ where: { id: primaryNodeId } }),
    prisma.catalogSecondaryNode.findUnique({ where: { id: secondaryNodeId } }),
  ]);

  if (!primary || !secondary) {
    throw new BadRequestException({
      code: 'TAXONOMY_NODE_NOT_FOUND',
      message: '分类节点不存在',
    });
  }
  if (secondary.primaryId !== primary.id) {
    throw new BadRequestException({
      code: 'TAXONOMY_INVALID_HIERARCHY',
      message: '二级分类不属于所选一级分类',
    });
  }

  return { primary, secondary };
}

export async function resolvePackTaxonomy(
  prisma: PrismaService,
  input: PackTaxonomyInput,
): Promise<ResolvedPackTaxonomy> {
  if (input.primaryNodeId && input.secondaryNodeId && input.versionNodeId) {
    const { primary, secondary } = await resolvePrimarySecondaryByNodeIds(
      prisma,
      input.primaryNodeId,
      input.secondaryNodeId,
    );
    const version = await prisma.catalogVersionNode.findUnique({
      where: { id: input.versionNodeId },
    });
    if (!version) {
      throw new BadRequestException({
        code: 'TAXONOMY_NODE_NOT_FOUND',
        message: '分类节点不存在',
      });
    }

    return {
      primaryNodeId: primary.id,
      secondaryNodeId: secondary.id,
      versionNodeId: version.id,
      primaryCategory: primary.slug,
      secondaryCategory: secondary.label,
      versionLabel: version.label,
    };
  }

  if (input.primaryNodeId && input.secondaryNodeId) {
    const { primary, secondary } = await resolvePrimarySecondaryByNodeIds(
      prisma,
      input.primaryNodeId,
      input.secondaryNodeId,
    );

    return {
      primaryNodeId: primary.id,
      secondaryNodeId: secondary.id,
      versionNodeId: null,
      primaryCategory: primary.slug,
      secondaryCategory: secondary.label,
      versionLabel: CATALOG_ALL_VERSION_LABEL,
    };
  }

  if (input.primaryCategory && input.secondaryCategory && input.versionLabel) {
    const primary = await prisma.catalogPrimaryNode.findUnique({
      where: { slug: input.primaryCategory },
    });
    if (!primary) {
      throw new BadRequestException({
        code: 'TAXONOMY_NODE_NOT_FOUND',
        message: '一级分类不存在',
      });
    }

    const secondary = await prisma.catalogSecondaryNode.findFirst({
      where: {
        primaryId: primary.id,
        label: input.secondaryCategory,
      },
    });
    const version = await prisma.catalogVersionNode.findFirst({
      where: { label: input.versionLabel },
    });

    if (!secondary || !version) {
      throw new BadRequestException({
        code: 'TAXONOMY_NODE_NOT_FOUND',
        message: '二级或版本分类不存在',
      });
    }

    return {
      primaryNodeId: primary.id,
      secondaryNodeId: secondary.id,
      versionNodeId: version.id,
      primaryCategory: primary.slug,
      secondaryCategory: secondary.label,
      versionLabel: version.label,
    };
  }

  if (input.primaryCategory && input.secondaryCategory) {
    const primary = await prisma.catalogPrimaryNode.findUnique({
      where: { slug: input.primaryCategory },
    });
    if (!primary) {
      throw new BadRequestException({
        code: 'TAXONOMY_NODE_NOT_FOUND',
        message: '一级分类不存在',
      });
    }

    const secondary = await prisma.catalogSecondaryNode.findFirst({
      where: {
        primaryId: primary.id,
        label: input.secondaryCategory,
      },
    });
    if (!secondary) {
      throw new BadRequestException({
        code: 'TAXONOMY_NODE_NOT_FOUND',
        message: '二级分类不存在',
      });
    }

    return {
      primaryNodeId: primary.id,
      secondaryNodeId: secondary.id,
      versionNodeId: null,
      primaryCategory: primary.slug,
      secondaryCategory: secondary.label,
      versionLabel: CATALOG_ALL_VERSION_LABEL,
    };
  }

  throw new BadRequestException({
    code: 'TAXONOMY_INCOMPLETE',
    message: '请提供一级与二级分类',
  });
}

export async function resolvePackTaxonomyUpdate(
  prisma: PrismaService,
  existing: {
    primaryNodeId: string | null;
    secondaryNodeId: string | null;
    versionNodeId: string | null;
    primaryCategory: string;
    secondaryCategory: string;
    versionLabel: string;
  },
  input: PackTaxonomyInput,
): Promise<ResolvedPackTaxonomy | undefined> {
  const hasNodeIds =
    input.primaryNodeId !== undefined ||
    input.secondaryNodeId !== undefined ||
    input.versionNodeId !== undefined;
  const hasLegacy =
    input.primaryCategory !== undefined ||
    input.secondaryCategory !== undefined ||
    input.versionLabel !== undefined;

  if (!hasNodeIds && !hasLegacy) {
    return undefined;
  }

  const resolvedVersionNodeId =
    input.versionNodeId === null
      ? undefined
      : (input.versionNodeId ?? existing.versionNodeId ?? undefined);

  return resolvePackTaxonomy(prisma, {
    primaryNodeId: input.primaryNodeId ?? existing.primaryNodeId ?? undefined,
    secondaryNodeId: input.secondaryNodeId ?? existing.secondaryNodeId ?? undefined,
    versionNodeId: resolvedVersionNodeId,
    primaryCategory: input.primaryCategory ?? existing.primaryCategory,
    secondaryCategory: input.secondaryCategory ?? existing.secondaryCategory,
    versionLabel: input.versionLabel ?? existing.versionLabel,
  });
}
