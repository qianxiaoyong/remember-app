import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import type { AdminVersionTaxonomyNodeResponse } from '@remember/contracts';
import { AdminPanel, adminPanelTableSx } from '../../components/admin-panel.js';
import { MonoText } from '../../components/mono-text.js';
import { adminColors } from '../../theme/admin-colors.js';

function StatusChip({ status }: { status: string }) {
  const active = status === 'active';
  return (
    <Chip
      label={active ? '启用' : status}
      size="small"
      sx={{ height: 20, fontSize: '0.75rem' }}
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
    />
  );
}

interface VersionsPanelProps {
  versions: AdminVersionTaxonomyNodeResponse[];
  versionSlug: string;
  versionLabel: string;
  onVersionSlugChange: (value: string) => void;
  onVersionLabelChange: (value: string) => void;
  onCreateVersion: () => void;
  onRename: (version: AdminVersionTaxonomyNodeResponse) => void;
  onDelete: (version: AdminVersionTaxonomyNodeResponse) => void;
  onMoveUp: (version: AdminVersionTaxonomyNodeResponse, index: number) => void;
  onMoveDown: (version: AdminVersionTaxonomyNodeResponse, index: number) => void;
}

export function VersionsPanel(props: VersionsPanelProps) {
  return (
    <AdminPanel title="页内分类" padded={false} sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Box
          sx={{
            px: 1.25,
            py: 0.75,
            borderBottom: `1px solid ${adminColors.border}`,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={0.75}>
            <TextField
              size="small"
              label="slug"
              value={props.versionSlug}
              onChange={(event) => {
                props.onVersionSlugChange(event.target.value);
              }}
              sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
            />
            <TextField
              size="small"
              label="展示名"
              value={props.versionLabel}
              onChange={(event) => {
                props.onVersionLabelChange(event.target.value);
              }}
              sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
            />
            <Button
              size="small"
              variant="contained"
              disabled={!props.versionSlug.trim() || !props.versionLabel.trim()}
              onClick={props.onCreateVersion}
              sx={{ whiteSpace: 'nowrap', px: 1.5 }}
            >
              新增
            </Button>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', ...adminPanelTableSx }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>展示名</TableCell>
                <TableCell>slug</TableCell>
                <TableCell width={48}>序</TableCell>
                <TableCell width={56}>状态</TableCell>
                <TableCell align="right" width={120}>
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.versions.map((version, index) => {
                const isFirst = index === 0;
                const isLast = index === props.versions.length - 1;
                return (
                  <TableRow key={version.id} hover>
                    <TableCell>{version.label}</TableCell>
                    <TableCell>
                      <MonoText variant="caption">{version.slug}</MonoText>
                    </TableCell>
                    <TableCell>{version.sortOrder}</TableCell>
                    <TableCell>
                      <StatusChip status={version.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        disabled={isFirst}
                        sx={{ minWidth: 0, px: 0.25, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onMoveUp(version, index);
                        }}
                      >
                        ↑
                      </Button>
                      <Button
                        size="small"
                        disabled={isLast}
                        sx={{ minWidth: 0, px: 0.25, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onMoveDown(version, index);
                        }}
                      >
                        ↓
                      </Button>
                      <Button
                        size="small"
                        sx={{ minWidth: 0, px: 0.5, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onRename(version);
                        }}
                      >
                        改
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{ minWidth: 0, px: 0.5, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onDelete(version);
                        }}
                      >
                        删
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </AdminPanel>
  );
}
