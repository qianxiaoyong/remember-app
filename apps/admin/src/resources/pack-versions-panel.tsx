import { useCallback, useEffect, useState } from 'react';
import type { AdminPackDetailResponse } from '@remember/contracts';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublishIcon from '@mui/icons-material/Publish';
import { useNotify, useRecordContext, useRefresh } from 'react-admin';
import {
  fetchPackDetail,
  publishPackVersion,
  updatePackVersionNote,
  uploadPackVersionZip,
} from '../api/pack-versions-api.js';
import { AdminApiError } from '../api/admin-api-client.js';

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${String(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN');
}

function formatAdminError(error: unknown, packId: string): string {
  if (error instanceof AdminApiError) {
    if (error.code === 'PACK_VERSION_EXISTS') {
      return (
        '该 zip 的内容版本号（packManifest.packVersion）已在下方表格中存在，不能重复上传。' +
        '若要更新内容，请先用 pack-builder 把 meta.json 里的 packVersion 改成新版本（如 1.0.1）再 build。'
      );
    }
    if (error.code === 'PACK_ID_MISMATCH') {
      return `包内 packId 与当前目录不一致。当前页面知识库 ID 为「${packId}」，请打开 zip 里的 packManifest.json 核对 packId 字段。`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : '请求失败';
}

function VersionNoteCell({
  packId,
  versionId,
  initialNote,
  onSaved,
}: {
  packId: string;
  versionId: string;
  initialNote?: string;
  onSaved: () => void;
}) {
  const notify = useNotify();
  const [value, setValue] = useState(initialNote ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(initialNote ?? '');
  }, [initialNote, versionId]);

  const save = async () => {
    const trimmed = value.trim();
    const normalized = trimmed.length > 0 ? trimmed : null;
    const previous = initialNote?.trim() || null;
    if (normalized === previous) {
      return;
    }

    setSaving(true);
    try {
      await updatePackVersionNote(packId, versionId, normalized);
      onSaved();
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : '备注保存失败', { type: 'error' });
      setValue(initialNote ?? '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TextField
      size="small"
      fullWidth
      placeholder="内部备注"
      value={value}
      disabled={saving}
      onChange={(event) => {
        setValue(event.target.value);
      }}
      onBlur={() => {
        void save();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
      slotProps={{ htmlInput: { maxLength: 500 } }}
      sx={{ minWidth: 160 }}
    />
  );
}

export function PackVersionsPanel({ embedded = false }: { embedded?: boolean }) {
  const record = useRecordContext<{ packId?: string }>();
  const notify = useNotify();
  const refresh = useRefresh();
  const packId = record?.packId;

  const [detail, setDetail] = useState<AdminPackDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    if (!packId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDetail(await fetchPackDetail(packId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '加载版本失败');
    } finally {
      setLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    void loadVersions();
  }, [loadVersions]);

  const handleUpload = async () => {
    if (!packId || !selectedFile) {
      notify('请先选择 zip 文件', { type: 'warning' });
      return;
    }

    setUploading(true);
    setError(null);
    setUploadSummary(null);
    try {
      const result = await uploadPackVersionZip(packId, selectedFile);
      setUploadSummary(
        `已上传 ${result.manifestSummary.packVersion}：${String(result.manifestSummary.cardCount)} 张卡片，` +
          `${String(result.manifestSummary.lexiconEntryCount)} 条 lexicon，` +
          `${String(result.manifestSummary.fileCount)} 个文件`,
      );
      setSelectedFile(null);
      notify('zip 上传成功', { type: 'success' });
      await loadVersions();
      refresh();
    } catch (uploadError) {
      const message = formatAdminError(uploadError, packId);
      setError(message);
      notify(message, { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (versionId: string, packVersion: string) => {
    if (!packId) {
      return;
    }

    setPublishingId(versionId);
    setError(null);
    try {
      await publishPackVersion(packId, versionId);
      notify(`已发布版本 ${packVersion}`, { type: 'success' });
      await loadVersions();
      refresh();
    } catch (publishError) {
      const message = publishError instanceof Error ? publishError.message : '发布失败';
      setError(message);
      notify(message, { type: 'error' });
    } finally {
      setPublishingId(null);
    }
  };

  if (!packId) {
    return null;
  }

  const content = (
    <>
      {!embedded ? (
        <Typography variant="h6" gutterBottom>
          版本与发布
        </Typography>
      ) : null}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        使用 pack-builder 构建并验签后的 zip；上传后创建 draft 版本，发布后将设为当前下载版本。
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" component="div">
          <strong>三个容易混淆的「版本」：</strong>
          <br />
          ① 基本信息 Tab「版本标签」（如人教版）= 商品展示用，与 zip 无关。
          <br />
          ② 下方表格「版本号」（如 1.0.0）= zip 内 packManifest.packVersion，上传校验的唯一依据。
          <br />
          ③ 列表页「当前版本」列 = 已发布为下载源的 packVersion。
          <br />
          查看 zip 内容：解压后打开根目录 <code>packManifest.json</code>，或看{' '}
          <code>tools/pack-builder/source/&lt;packId&gt;/meta.json</code> 里的 packVersion。
        </Typography>
      </Alert>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {uploadSummary ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {uploadSummary}
        </Alert>
      ) : null}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
        <Button variant="outlined" component="label" disabled={uploading}>
          选择 zip
          <input
            hidden
            type="file"
            accept=".zip,application/zip"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              setUploadSummary(null);
            }}
          />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {selectedFile ? selectedFile.name : '未选择文件'}
        </Typography>
        <Button
          variant="contained"
          startIcon={
            uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />
          }
          disabled={uploading || !selectedFile}
          onClick={() => {
            void handleUpload();
          }}
        >
          上传并校验
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>版本号</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>协议</TableCell>
              <TableCell>大小</TableCell>
              <TableCell>SHA256</TableCell>
              <TableCell>上传时间</TableCell>
              <TableCell>备注</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detail?.versions.length ? (
              detail.versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    {version.packVersion}
                    {version.isCurrent ? (
                      <Chip label="当前" size="small" color="primary" sx={{ ml: 1 }} />
                    ) : null}
                  </TableCell>
                  <TableCell>{version.status}</TableCell>
                  <TableCell>v{String(version.protocolVersion)}</TableCell>
                  <TableCell>{formatBytes(version.sizeBytes)}</TableCell>
                  <TableCell>{`${version.sha256.slice(0, 8)}…`}</TableCell>
                  <TableCell>{formatDateTime(version.publishedAt)}</TableCell>
                  <TableCell>
                    <VersionNoteCell
                      packId={packId}
                      versionId={version.id}
                      {...(version.note !== undefined ? { initialNote: version.note } : {})}
                      onSaved={() => {
                        void loadVersions();
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {!version.isCurrent ? (
                      <Button
                        size="small"
                        startIcon={
                          publishingId === version.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <PublishIcon />
                          )
                        }
                        disabled={publishingId !== null}
                        onClick={() => {
                          void handlePublish(version.id, version.packVersion);
                        }}
                      >
                        设为当前
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        已发布
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary">暂无版本，请先上传 zip</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );

  if (embedded) {
    return <Box sx={{ p: 2 }}>{content}</Box>;
  }

  return (
    <Card variant="outlined" sx={{ m: 2 }}>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
