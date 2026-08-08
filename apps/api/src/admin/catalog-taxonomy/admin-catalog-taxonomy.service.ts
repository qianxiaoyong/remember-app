import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  AdminCatalogTaxonomyResponse,
  AdminCreatePrimaryTaxonomyNodeRequest,
  AdminCreateSecondaryTaxonomyNodeRequest,
  AdminCreateVersionTaxonomyNodeRequest,
  AdminPrimaryTaxonomyNodeResponse,
  AdminSecondaryTaxonomyNodeResponse,
  AdminUpdatePrimaryTaxonomyNodeRequest,
  AdminUpdateSecondaryTaxonomyNodeRequest,
  AdminUpdateVersionTaxonomyNodeRequest,
  AdminVersionTaxonomyNodeResponse,
} from '@remember/contracts';
import {
  adminCatalogTaxonomyResponseSchema,
} from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AdminCatalogTaxonomyRepository } from './admin-catalog-taxonomy.repository.js';
import {
  toAdminPrimaryTaxonomyNode,
  toAdminSecondaryTaxonomyNode,
  toAdminVersionTaxonomyNode,
} from './admin-catalog-taxonomy.mapper.js';

@Injectable()
export class AdminCatalogTaxonomyService {
  constructor(
    private readonly repository: AdminCatalogTaxonomyRepository,
    private readonly prisma: PrismaService,
  ) {}

  async listTaxonomy(): Promise<AdminCatalogTaxonomyResponse> {
    const [primaries, versions] = await Promise.all([
      this.repository.listAllTaxonomy(),
      this.repository.listAllVersions(),
    ]);

    return adminCatalogTaxonomyResponseSchema.parse({
      primaries: primaries.map((primary) => ({
        id: primary.id,
        slug: primary.slug,
        label: primary.label,
        sortOrder: primary.sortOrder,
        status: primary.status,
        children: primary.children.map((secondary) => ({
          id: secondary.id,
          slug: secondary.slug,
          label: secondary.label,
          sortOrder: secondary.sortOrder,
          status: secondary.status,
        })),
      })),
      versions: versions.map((version) => ({
        id: version.id,
        slug: version.slug,
        label: version.label,
        sortOrder: version.sortOrder,
        status: version.status,
      })),
    });
  }

  async createPrimary(
    input: AdminCreatePrimaryTaxonomyNodeRequest,
  ): Promise<AdminPrimaryTaxonomyNodeResponse> {
    const sortOrder = input.sortOrder ?? (await this.repository.nextPrimarySortOrder());
    try {
      const created = await this.prisma.catalogPrimaryNode.create({
        data: {
          slug: input.slug,
          label: input.label,
          sortOrder,
          status: input.status,
        },
      });
      return toAdminPrimaryTaxonomyNode(created);
    } catch (error) {
      throwTaxonomyWriteConflict(error);
    }
  }

  async updatePrimary(
    id: string,
    input: AdminUpdatePrimaryTaxonomyNodeRequest,
  ): Promise<AdminPrimaryTaxonomyNodeResponse> {
    const existing = await this.repository.findPrimaryById(id);
    if (!existing) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '一级分类不存在' });
    }

    const updated = await this.prisma.catalogPrimaryNode.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
    return toAdminPrimaryTaxonomyNode(updated);
  }

  async deletePrimary(id: string): Promise<void> {
    const existing = await this.repository.findPrimaryById(id);
    if (!existing) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '一级分类不存在' });
    }

    const [packCount, secondaryCount] = await Promise.all([
      this.repository.countPacksByPrimaryNodeId(id),
      this.repository.countSecondariesByPrimaryId(id),
    ]);
    if (packCount > 0 || secondaryCount > 0) {
      throw new ConflictException({
        code: 'TAXONOMY_NODE_IN_USE',
        message: '该分类下仍有知识库或子分类，无法删除',
      });
    }

    await this.prisma.catalogPrimaryNode.delete({ where: { id } });
  }

  async createSecondary(
    primaryId: string,
    input: AdminCreateSecondaryTaxonomyNodeRequest,
  ): Promise<AdminSecondaryTaxonomyNodeResponse> {
    const primary = await this.repository.findPrimaryById(primaryId);
    if (!primary) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '一级分类不存在' });
    }

    const sortOrder = input.sortOrder ?? (await this.repository.nextSecondarySortOrder(primaryId));
    try {
      const created = await this.prisma.catalogSecondaryNode.create({
        data: {
          primaryId,
          slug: input.slug,
          label: input.label,
          sortOrder,
          status: input.status,
        },
      });
      return toAdminSecondaryTaxonomyNode(created);
    } catch (error) {
      throwTaxonomyWriteConflict(error);
    }
  }

  async updateSecondary(
    id: string,
    input: AdminUpdateSecondaryTaxonomyNodeRequest,
  ): Promise<AdminSecondaryTaxonomyNodeResponse> {
    const existing = await this.repository.findSecondaryById(id);
    if (!existing) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '二级分类不存在' });
    }

    const updated = await this.prisma.catalogSecondaryNode.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
    return toAdminSecondaryTaxonomyNode(updated);
  }

  async deleteSecondary(id: string): Promise<void> {
    const existing = await this.repository.findSecondaryById(id);
    if (!existing) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '二级分类不存在' });
    }

    const packCount = await this.repository.countPacksBySecondaryNodeId(id);
    if (packCount > 0) {
      throw new ConflictException({
        code: 'TAXONOMY_NODE_IN_USE',
        message: '该分类下仍有知识库，无法删除',
      });
    }

    await this.prisma.catalogSecondaryNode.delete({ where: { id } });
  }

  async createVersion(
    input: AdminCreateVersionTaxonomyNodeRequest,
  ): Promise<AdminVersionTaxonomyNodeResponse> {
    const sortOrder = input.sortOrder ?? (await this.repository.nextVersionSortOrder());
    try {
      const created = await this.prisma.catalogVersionNode.create({
        data: {
          slug: input.slug,
          label: input.label,
          sortOrder,
          status: input.status,
        },
      });
      return toAdminVersionTaxonomyNode(created);
    } catch (error) {
      throwTaxonomyWriteConflict(error);
    }
  }

  async updateVersion(
    id: string,
    input: AdminUpdateVersionTaxonomyNodeRequest,
  ): Promise<AdminVersionTaxonomyNodeResponse> {
    const existing = await this.repository.findVersionById(id);
    if (!existing) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '版本分类不存在' });
    }

    const updated = await this.prisma.catalogVersionNode.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
    return toAdminVersionTaxonomyNode(updated);
  }

  async deleteVersion(id: string): Promise<void> {
    const existing = await this.repository.findVersionById(id);
    if (!existing) {
      throw new NotFoundException({ code: 'TAXONOMY_NODE_NOT_FOUND', message: '版本分类不存在' });
    }

    const packCount = await this.repository.countPacksByVersionNodeId(id);
    if (packCount > 0) {
      throw new ConflictException({
        code: 'TAXONOMY_NODE_IN_USE',
        message: '该版本下仍有知识库，无法删除',
      });
    }

    await this.prisma.catalogVersionNode.delete({ where: { id } });
  }
}

function throwTaxonomyWriteConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException({
      code: 'TAXONOMY_SLUG_EXISTS',
      message: 'slug 已存在，请换一个内部标识',
    });
  }
  throw error;
}
