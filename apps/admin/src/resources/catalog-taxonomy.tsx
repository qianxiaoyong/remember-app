import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { AdminCatalogTaxonomyResponse } from '@remember/contracts';
import { Title } from 'react-admin';
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
} from '../api/catalog-taxonomy-api.js';
import { AdminApiError } from '../api/admin-api-client.js';

export function CatalogTaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<AdminCatalogTaxonomyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [primarySlug, setPrimarySlug] = useState('');
  const [primaryLabel, setPrimaryLabel] = useState('');
  const [versionSlug, setVersionSlug] = useState('');
  const [versionLabel, setVersionLabel] = useState('');

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

  async function runAction(action: () => Promise<void>) {
    setErrorMessage(null);
    try {
      await action();
      await reload();
    } catch (error) {
      setErrorMessage(
        error instanceof AdminApiError ? error.message : error instanceof Error ? error.message : '操作失败',
      );
    }
  }

  return (
    <>
      <Title title="分类管理" />
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          资料页分类管理
        </Typography>
        {errorMessage ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        ) : null}

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                一级分类
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  label="slug"
                  size="small"
                  value={primarySlug}
                  onChange={(event) => setPrimarySlug(event.target.value)}
                />
                <TextField
                  label="展示名"
                  size="small"
                  value={primaryLabel}
                  onChange={(event) => setPrimaryLabel(event.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    void runAction(async () => {
                      await createPrimaryTaxonomyNode({ slug: primarySlug.trim(), label: primaryLabel.trim() });
                      setPrimarySlug('');
                      setPrimaryLabel('');
                    });
                  }}
                >
                  新增
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>slug</TableCell>
                    <TableCell>展示名</TableCell>
                    <TableCell>排序</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxonomy?.primaries.map((primary) => (
                    <TableRow key={primary.id}>
                      <TableCell>{primary.slug}</TableCell>
                      <TableCell>{primary.label}</TableCell>
                      <TableCell>{primary.sortOrder}</TableCell>
                      <TableCell>{primary.status}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => {
                            const label = window.prompt('展示名', primary.label);
                            if (!label?.trim()) return;
                            void runAction(() => updatePrimaryTaxonomyNode(primary.id, { label: label.trim() }));
                          }}
                        >
                          改名
                        </Button>
                        <Button
                          color="error"
                          size="small"
                          onClick={() => {
                            if (!window.confirm(`删除一级「${primary.label}」？`)) return;
                            void runAction(() => deletePrimaryTaxonomyNode(primary.id));
                          }}
                        >
                          删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {taxonomy?.primaries.map((primary) => (
            <Card key={primary.id}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  二级分类 · {primary.label}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>slug</TableCell>
                      <TableCell>展示名</TableCell>
                      <TableCell>排序</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {primary.children.map((secondary) => (
                      <TableRow key={secondary.id}>
                        <TableCell>{secondary.slug}</TableCell>
                        <TableCell>{secondary.label}</TableCell>
                        <TableCell>{secondary.sortOrder}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              const label = window.prompt('展示名', secondary.label);
                              if (!label?.trim()) return;
                              void runAction(() =>
                                updateSecondaryTaxonomyNode(secondary.id, { label: label.trim() }),
                              );
                            }}
                          >
                            改名
                          </Button>
                          <Button
                            color="error"
                            size="small"
                            onClick={() => {
                              if (!window.confirm(`删除二级「${secondary.label}」？`)) return;
                              void runAction(() => deleteSecondaryTaxonomyNode(secondary.id));
                            }}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const slug = window.prompt('slug（如 grade4）');
                      const label = window.prompt('展示名（如 四年级）');
                      if (!slug?.trim() || !label?.trim()) return;
                      void runAction(() =>
                        createSecondaryTaxonomyNode(primary.id, {
                          slug: slug.trim(),
                          label: label.trim(),
                        }),
                      );
                    }}
                  >
                    新增二级
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                教材版本
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  label="slug"
                  size="small"
                  value={versionSlug}
                  onChange={(event) => setVersionSlug(event.target.value)}
                />
                <TextField
                  label="展示名"
                  size="small"
                  value={versionLabel}
                  onChange={(event) => setVersionLabel(event.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    void runAction(async () => {
                      await createVersionTaxonomyNode({
                        slug: versionSlug.trim(),
                        label: versionLabel.trim(),
                      });
                      setVersionSlug('');
                      setVersionLabel('');
                    });
                  }}
                >
                  新增
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>slug</TableCell>
                    <TableCell>展示名</TableCell>
                    <TableCell>排序</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxonomy?.versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>{version.slug}</TableCell>
                      <TableCell>{version.label}</TableCell>
                      <TableCell>{version.sortOrder}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => {
                            const label = window.prompt('展示名', version.label);
                            if (!label?.trim()) return;
                            void runAction(() => updateVersionTaxonomyNode(version.id, { label: label.trim() }));
                          }}
                        >
                          改名
                        </Button>
                        <Button
                          color="error"
                          size="small"
                          onClick={() => {
                            if (!window.confirm(`删除版本「${version.label}」？`)) return;
                            void runAction(() => deleteVersionTaxonomyNode(version.id));
                          }}
                        >
                          删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
