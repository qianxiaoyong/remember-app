import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Title } from 'react-admin';
import { AdminPageHeader } from '../../components/admin-page-header.js';
import type {
  AdminCatalogTaxonomyResponse,
  AdminSecondaryTaxonomyNodeResponse,
  AdminVersionTaxonomyNodeResponse,
} from '@remember/contracts';
import {
  createPrimaryTaxonomyNode,
  createSecondaryTaxonomyNode,
  createVersionTaxonomyNode,
  deletePrimaryTaxonomyNode,
  deleteSecondaryTaxonomyNode,
  deleteVersionTaxonomyNode,
  fetchAdminCatalogTaxonomy,
  updatePrimaryTaxonomyNode,
  updateSecondaryTaxonomyNode,
  updateVersionTaxonomyNode,
} from '../../api/catalog-taxonomy-api.js';
import { AdminApiError } from '../../api/admin-api-client.js';
import { PrimarySidebar, SecondaryPanel } from './catalog-taxonomy-panels.js';
import { VersionsPanel } from './catalog-taxonomy-versions-panel.js';
import {
  TaxonomyCreateDialog,
  TaxonomyDeleteDialog,
  TaxonomyLabelDialog,
} from './taxonomy-dialogs.js';

type PrimaryTaxonomyNode = AdminCatalogTaxonomyResponse['primaries'][number];

type EditTarget =
  | { kind: 'primary'; node: PrimaryTaxonomyNode }
  | { kind: 'secondary'; node: AdminSecondaryTaxonomyNodeResponse }
  | { kind: 'version'; node: AdminVersionTaxonomyNodeResponse };

type DeleteTarget = EditTarget;

interface SortableNode {
  id: string;
  sortOrder: number;
}

interface SwapSortOrderInput {
  items: SortableNode[];
  index: number;
  direction: 'up' | 'down';
  updateNode: (id: string, sortOrder: number) => Promise<void>;
}

async function swapAdjacentSortOrder(input: SwapSortOrderInput): Promise<void> {
  const targetIndex = input.direction === 'up' ? input.index - 1 : input.index + 1;
  if (targetIndex < 0 || targetIndex >= input.items.length) {
    return;
  }
  const current = input.items[input.index];
  const adjacent = input.items[targetIndex];
  if (!current || !adjacent) {
    return;
  }
  await Promise.all([
    input.updateNode(current.id, adjacent.sortOrder),
    input.updateNode(adjacent.id, current.sortOrder),
  ]);
}

export function CatalogTaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<AdminCatalogTaxonomyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<string | null>(null);
  const [secondarySlug, setSecondarySlug] = useState('');
  const [secondaryLabel, setSecondaryLabel] = useState('');
  const [versionSlug, setVersionSlug] = useState('');
  const [versionLabel, setVersionLabel] = useState('');
  const [createPrimaryOpen, setCreatePrimaryOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const reload = useCallback(async () => {
    setErrorMessage(null);
    try {
      setTaxonomy(await fetchAdminCatalogTaxonomy());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '加载失败');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!taxonomy?.primaries.length) {
      setSelectedPrimaryId(null);
      return;
    }
    const stillExists = taxonomy.primaries.some((primary) => primary.id === selectedPrimaryId);
    if (!selectedPrimaryId || !stillExists) {
      setSelectedPrimaryId(taxonomy.primaries[0]?.id ?? null);
    }
  }, [taxonomy, selectedPrimaryId]);

  const selectedPrimary = useMemo(
    () => taxonomy?.primaries.find((primary) => primary.id === selectedPrimaryId) ?? null,
    [taxonomy, selectedPrimaryId],
  );

  async function runAction(action: () => Promise<void>) {
    setErrorMessage(null);
    try {
      await action();
      await reload();
    } catch (error) {
      setErrorMessage(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '操作失败',
      );
    }
  }

  async function handleRename(label: string) {
    if (!editTarget) {
      return;
    }
    const target = editTarget;
    setEditTarget(null);
    await runAction(async () => {
      if (target.kind === 'primary') {
        await updatePrimaryTaxonomyNode(target.node.id, { label });
      } else if (target.kind === 'secondary') {
        await updateSecondaryTaxonomyNode(target.node.id, { label });
      } else {
        await updateVersionTaxonomyNode(target.node.id, { label });
      }
    });
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }
    const target = deleteTarget;
    setDeleteTarget(null);
    await runAction(async () => {
      if (target.kind === 'primary') {
        await deletePrimaryTaxonomyNode(target.node.id);
      } else if (target.kind === 'secondary') {
        await deleteSecondaryTaxonomyNode(target.node.id);
      } else {
        await deleteVersionTaxonomyNode(target.node.id);
      }
    });
  }

  async function handleMovePrimary(index: number, direction: 'up' | 'down') {
    if (!taxonomy) {
      return;
    }
    await runAction(async () => {
      await swapAdjacentSortOrder({
        items: taxonomy.primaries,
        index,
        direction,
        updateNode: async (id, sortOrder) => {
          await updatePrimaryTaxonomyNode(id, { sortOrder });
        },
      });
    });
  }

  async function handleMoveSecondary(index: number, direction: 'up' | 'down') {
    if (!selectedPrimary) {
      return;
    }
    await runAction(async () => {
      await swapAdjacentSortOrder({
        items: selectedPrimary.children,
        index,
        direction,
        updateNode: async (id, sortOrder) => {
          await updateSecondaryTaxonomyNode(id, { sortOrder });
        },
      });
    });
  }

  async function handleMoveVersion(index: number, direction: 'up' | 'down') {
    if (!taxonomy) {
      return;
    }
    await runAction(async () => {
      await swapAdjacentSortOrder({
        items: taxonomy.versions,
        index,
        direction,
        updateNode: async (id, sortOrder) => {
          await updateVersionTaxonomyNode(id, { sortOrder });
        },
      });
    });
  }

  return (
    <>
      <Title title="分类管理" />
      <AdminPageHeader title="分类管理" meta="维护一级 / 二级分类与页内分类，供知识库挂载" />
      <Box sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
        {errorMessage ? (
          <Typography color="error" sx={{ mb: 1, fontSize: '0.875rem' }}>
            {errorMessage}
          </Typography>
        ) : null}

        <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
          <Grid size={{ xs: 12, lg: 2.5 }} sx={{ height: '100%', minHeight: 0 }}>
            <PrimarySidebar
              primaries={taxonomy?.primaries ?? []}
              selectedPrimaryId={selectedPrimaryId}
              onSelect={setSelectedPrimaryId}
              onCreateClick={() => {
                setCreatePrimaryOpen(true);
              }}
              onRename={(node) => {
                setEditTarget({ kind: 'primary', node });
              }}
              onDelete={(node) => {
                setDeleteTarget({ kind: 'primary', node });
              }}
              onMoveUp={(_node, index) => {
                void handleMovePrimary(index, 'up');
              }}
              onMoveDown={(_node, index) => {
                void handleMovePrimary(index, 'down');
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 5.5 }} sx={{ height: '100%', minHeight: 0 }}>
            <SecondaryPanel
              primary={selectedPrimary}
              secondarySlug={secondarySlug}
              secondaryLabel={secondaryLabel}
              onSecondarySlugChange={setSecondarySlug}
              onSecondaryLabelChange={setSecondaryLabel}
              onCreateSecondary={() => {
                if (!selectedPrimary) {
                  return;
                }
                void runAction(async () => {
                  await createSecondaryTaxonomyNode(selectedPrimary.id, {
                    slug: secondarySlug.trim(),
                    label: secondaryLabel.trim(),
                  });
                  setSecondarySlug('');
                  setSecondaryLabel('');
                });
              }}
              onRename={(node) => {
                setEditTarget({ kind: 'secondary', node });
              }}
              onDelete={(node) => {
                setDeleteTarget({ kind: 'secondary', node });
              }}
              onMoveUp={(_node, index) => {
                void handleMoveSecondary(index, 'up');
              }}
              onMoveDown={(_node, index) => {
                void handleMoveSecondary(index, 'down');
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} sx={{ height: '100%', minHeight: 0 }}>
            <VersionsPanel
              versions={taxonomy?.versions ?? []}
              versionSlug={versionSlug}
              versionLabel={versionLabel}
              onVersionSlugChange={setVersionSlug}
              onVersionLabelChange={setVersionLabel}
              onCreateVersion={() => {
                void runAction(async () => {
                  await createVersionTaxonomyNode({
                    slug: versionSlug.trim(),
                    label: versionLabel.trim(),
                  });
                  setVersionSlug('');
                  setVersionLabel('');
                });
              }}
              onRename={(node) => {
                setEditTarget({ kind: 'version', node });
              }}
              onDelete={(node) => {
                setDeleteTarget({ kind: 'version', node });
              }}
              onMoveUp={(_node, index) => {
                void handleMoveVersion(index, 'up');
              }}
              onMoveDown={(_node, index) => {
                void handleMoveVersion(index, 'down');
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <TaxonomyCreateDialog
        open={createPrimaryOpen}
        title="新增一级分类"
        slugPlaceholder="primary"
        labelPlaceholder="小学英语"
        onClose={() => {
          setCreatePrimaryOpen(false);
        }}
        onConfirm={(input) => {
          setCreatePrimaryOpen(false);
          void runAction(async () => {
            await createPrimaryTaxonomyNode(input);
          });
        }}
      />

      <TaxonomyLabelDialog
        open={editTarget !== null}
        title={
          editTarget?.kind === 'primary'
            ? '修改一级展示名'
            : editTarget?.kind === 'secondary'
              ? '修改二级展示名'
              : '修改页内分类展示名'
        }
        label={editTarget?.node.label ?? ''}
        onClose={() => {
          setEditTarget(null);
        }}
        onConfirm={(label) => {
          void handleRename(label);
        }}
      />

      <TaxonomyDeleteDialog
        open={deleteTarget !== null}
        title="确认删除"
        description={
          deleteTarget ? `确定删除「${deleteTarget.node.label}」？若仍有知识库挂载将无法删除。` : ''
        }
        onClose={() => {
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}
