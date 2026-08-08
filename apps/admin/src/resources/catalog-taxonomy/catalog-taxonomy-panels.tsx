import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type {
  AdminCatalogTaxonomyResponse,
  AdminSecondaryTaxonomyNodeResponse,
} from '@remember/contracts';
import { AdminPanel, adminPanelTableSx } from '../../components/admin-panel.js';
import { MonoText } from '../../components/mono-text.js';
import { adminColors } from '../../theme/admin-colors.js';

type PrimaryTaxonomyNode = AdminCatalogTaxonomyResponse['primaries'][number];

interface PrimarySidebarProps {
  primaries: PrimaryTaxonomyNode[];
  selectedPrimaryId: string | null;
  onSelect: (id: string) => void;
  onCreateClick: () => void;
  onRename: (primary: PrimaryTaxonomyNode) => void;
  onDelete: (primary: PrimaryTaxonomyNode) => void;
  onMoveUp: (primary: PrimaryTaxonomyNode, index: number) => void;
  onMoveDown: (primary: PrimaryTaxonomyNode, index: number) => void;
}

export function PrimarySidebar(props: PrimarySidebarProps) {
  return (
    <AdminPanel
      title="一级"
      padded={false}
      sx={{ height: '100%' }}
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={props.onCreateClick}
          sx={{ minWidth: 0, px: 1 }}
        >
          +
        </Button>
      }
    >
      <List dense disablePadding sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {props.primaries.map((primary, index) => {
          const selected = primary.id === props.selectedPrimaryId;
          const isFirst = index === 0;
          const isLast = index === props.primaries.length - 1;
          return (
            <ListItemButton
              key={primary.id}
              selected={selected}
              onClick={() => {
                props.onSelect(primary.id);
              }}
              sx={{
                py: 0.25,
                minHeight: 36,
                '&.Mui-selected': { bgcolor: adminColors.accentSoft },
              }}
            >
              <ListItemText
                primary={primary.label}
                slotProps={{
                  primary: { fontSize: '0.875rem', fontWeight: selected ? 600 : 400 },
                }}
              />
              <Stack
                direction="row"
                spacing={0}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Button
                  size="small"
                  disabled={isFirst}
                  sx={{ minWidth: 0, px: 0.25, fontSize: '0.75rem' }}
                  onClick={() => {
                    props.onMoveUp(primary, index);
                  }}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  disabled={isLast}
                  sx={{ minWidth: 0, px: 0.25, fontSize: '0.75rem' }}
                  onClick={() => {
                    props.onMoveDown(primary, index);
                  }}
                >
                  ↓
                </Button>
                <Button
                  size="small"
                  sx={{ minWidth: 0, px: 0.5, fontSize: '0.75rem' }}
                  onClick={() => {
                    props.onRename(primary);
                  }}
                >
                  改
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  sx={{ p: 0.25 }}
                  onClick={() => {
                    props.onDelete(primary);
                  }}
                >
                  ×
                </IconButton>
              </Stack>
            </ListItemButton>
          );
        })}
      </List>
    </AdminPanel>
  );
}

interface SecondaryPanelProps {
  primary: PrimaryTaxonomyNode | null;
  secondarySlug: string;
  secondaryLabel: string;
  onSecondarySlugChange: (value: string) => void;
  onSecondaryLabelChange: (value: string) => void;
  onCreateSecondary: () => void;
  onRename: (secondary: AdminSecondaryTaxonomyNodeResponse) => void;
  onDelete: (secondary: AdminSecondaryTaxonomyNodeResponse) => void;
  onMoveUp: (secondary: AdminSecondaryTaxonomyNodeResponse, index: number) => void;
  onMoveDown: (secondary: AdminSecondaryTaxonomyNodeResponse, index: number) => void;
}

export function SecondaryPanel(props: SecondaryPanelProps) {
  if (!props.primary) {
    return (
      <AdminPanel title="二级" sx={{ height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          请选择一级分类
        </Typography>
      </AdminPanel>
    );
  }

  const secondaries = props.primary.children;

  return (
    <AdminPanel title={`二级 · ${props.primary.label}`} padded={false} sx={{ height: '100%' }}>
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
              value={props.secondarySlug}
              onChange={(event) => {
                props.onSecondarySlugChange(event.target.value);
              }}
              sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
            />
            <TextField
              size="small"
              label="展示名"
              value={props.secondaryLabel}
              onChange={(event) => {
                props.onSecondaryLabelChange(event.target.value);
              }}
              sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
            />
            <Button
              size="small"
              variant="contained"
              disabled={!props.secondarySlug.trim() || !props.secondaryLabel.trim()}
              onClick={props.onCreateSecondary}
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
                <TableCell align="right" width={120}>
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {secondaries.map((secondary, index) => {
                const isFirst = index === 0;
                const isLast = index === secondaries.length - 1;
                return (
                  <TableRow key={secondary.id} hover>
                    <TableCell>{secondary.label}</TableCell>
                    <TableCell>
                      <MonoText variant="caption">{secondary.slug}</MonoText>
                    </TableCell>
                    <TableCell>{secondary.sortOrder}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        disabled={isFirst}
                        sx={{ minWidth: 0, px: 0.25, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onMoveUp(secondary, index);
                        }}
                      >
                        ↑
                      </Button>
                      <Button
                        size="small"
                        disabled={isLast}
                        sx={{ minWidth: 0, px: 0.25, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onMoveDown(secondary, index);
                        }}
                      >
                        ↓
                      </Button>
                      <Button
                        size="small"
                        sx={{ minWidth: 0, px: 0.5, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onRename(secondary);
                        }}
                      >
                        改
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{ minWidth: 0, px: 0.5, fontSize: '0.75rem' }}
                        onClick={() => {
                          props.onDelete(secondary);
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
