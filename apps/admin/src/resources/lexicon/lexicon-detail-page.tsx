import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublishIcon from '@mui/icons-material/Publish';
import { Title, useNavigate, useNotify, useParams } from 'react-admin';
import { useLocation } from 'react-router-dom';
import type { AdminLexiconDetail } from '@remember/contracts';
import { fetchLexiconDetail, publishLemma } from '../../api/lexicon-api.js';
import { AdminApiError } from '../../api/admin-api-client.js';
import { AdminPageHeader } from '../../components/admin-page-header.js';
import { AdminPanel, adminPanelTableSx } from '../../components/admin-panel.js';
import { LemmaStatusChip } from '../../components/lemma-status-chip.js';
import { MonoText } from '../../components/mono-text.js';

const FRAGMENT_TYPE_LABELS: Record<string, string> = {
  definition_zh: '中文释义',
  definition_en: '英文释义',
  example: '例句',
  mnemonic: '助记',
  morphology: '词形',
  note: '备注',
};

function formatFragmentContent(content: Record<string, unknown>): string {
  if (typeof content.text === 'string') {
    return content.text;
  }
  if (typeof content.en === 'string' && typeof content.zh === 'string') {
    return `${content.en} / ${content.zh}`;
  }
  return JSON.stringify(content);
}

function formatIsoTime(value?: string): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('zh-CN');
}

export function LexiconDetailPage() {
  const params = useParams();
  const rawLemmaKey = params.lemmaKey;
  const lemmaKey = typeof rawLemmaKey === 'string' ? decodeURIComponent(rawLemmaKey) : '';
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();

  const [detail, setDetail] = useState<AdminLexiconDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!lemmaKey) {
      setErrorMessage('缺少词条 key');
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const loaded = await fetchLexiconDetail(lemmaKey);
      setDetail(loaded);
    } catch (error) {
      setDetail(null);
      setErrorMessage(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '加载失败',
      );
    } finally {
      setLoading(false);
    }
  }, [lemmaKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handlePublish = async () => {
    if (!detail) {
      return;
    }
    setPublishing(true);
    try {
      await publishLemma(detail.lemmaKey);
      notify('词条已发布', { type: 'success' });
      await reload();
    } catch (error) {
      notify(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '发布失败',
        { type: 'error' },
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <Title title={detail ? `${detail.headword} · 中心词库` : '词条详情'} />
      <AdminPageHeader
        title={detail?.headword ?? lemmaKey}
        meta={
          detail ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <LemmaStatusChip status={detail.status} />
              <MonoText>{detail.lemmaKey}</MonoText>
            </Stack>
          ) : (
            '词条详情'
          )
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                navigate({ pathname: '/lexicon', search: location.search });
              }}
            >
              返回列表
            </Button>
            {detail?.status === 'draft' ? (
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                disabled={publishing}
                onClick={() => void handlePublish()}
              >
                发布
              </Button>
            ) : null}
          </Stack>
        }
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : detail ? (
        <Stack spacing={1.5}>
          <AdminPanel title="基本信息">
            <Stack spacing={0.75}>
              <Typography variant="body2">
                <strong>音标：</strong>
                {detail.ipa ?? '—'}
              </Typography>
              <Typography variant="body2">
                <strong>词性：</strong>
                {detail.pos ?? '—'}
              </Typography>
              <Typography variant="body2">
                <strong>来源：</strong>
                {detail.source}
              </Typography>
              <Typography variant="body2">
                <strong>发布时间：</strong>
                {formatIsoTime(detail.publishedAt)}
              </Typography>
              <Typography variant="body2">
                <strong>更新时间：</strong>
                {formatIsoTime(detail.updatedAt)}
              </Typography>
            </Stack>
          </AdminPanel>

          <AdminPanel
            title="片段"
            subtitle={`${String(detail.fragments.length)} 条`}
            padded={false}
          >
            {detail.fragments.length === 0 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography color="text.secondary">暂无片段</Typography>
              </Box>
            ) : (
              <Box sx={{ overflow: 'auto', ...adminPanelTableSx }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>类型</TableCell>
                      <TableCell>内容</TableCell>
                      <TableCell>来源</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.fragments.map((fragment) => (
                      <TableRow key={fragment.id}>
                        <TableCell>
                          {FRAGMENT_TYPE_LABELS[fragment.fragmentType] ?? fragment.fragmentType}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', maxWidth: 480 }}>
                          {formatFragmentContent(fragment.content)}
                        </TableCell>
                        <TableCell>{fragment.source}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </AdminPanel>

          <AdminPanel title="词形" subtitle={`${String(detail.forms.length)} 条`} padded={false}>
            {detail.forms.length === 0 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography color="text.secondary">暂无词形映射</Typography>
              </Box>
            ) : (
              <Box sx={{ overflow: 'auto', ...adminPanelTableSx }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>form key</TableCell>
                      <TableCell>展示形</TableCell>
                      <TableCell>类型</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.forms.map((form) => (
                      <TableRow key={form.formKey}>
                        <TableCell>{form.formKey}</TableCell>
                        <TableCell>{form.displayForm}</TableCell>
                        <TableCell>{form.formType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </AdminPanel>

          {detail.tags.length > 0 ? (
            <AdminPanel title="标签">
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {detail.tags.map((tag) => (
                  <Chip key={tag.tagKey} label={`${tag.labelZh} (${tag.tagKey})`} size="small" />
                ))}
              </Stack>
            </AdminPanel>
          ) : null}
        </Stack>
      ) : null}
    </>
  );
}
