import { useState } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Create, NumberInput, SimpleForm, TextInput, required, useNotify, useRedirect } from 'react-admin';
import type { AdminCreateRedemptionBatchRequest } from '@remember/contracts';
import { AdminPageHeader } from '../components/admin-page-header.js';
import { createRedemptionBatch } from '../api/redemption-api.js';
import { AdminApiError } from '../api/admin-api-client.js';
import { RedemptionBatchResultDialog } from './redemption-code-row-actions.js';

export function RedemptionBatchCreate() {
  const notify = useNotify();
  const redirect = useRedirect();
  const [resultCodes, setResultCodes] = useState<string[]>([]);
  const [resultOpen, setResultOpen] = useState(false);

  return (
    <>
      <Create title={false} component="div">
        <AdminPageHeader
          title="批量生成兑换码"
          meta="为指定知识库一次性生成多条兑换码，生成后可复制导出"
        />
        <Box sx={{ maxWidth: 560 }}>
          <SimpleForm
            onSubmit={async (values: Record<string, unknown>) => {
              try {
                const response = await createRedemptionBatch({
                  packId: String(values.packId),
                  count: Number(values.count),
                  maxRedemptions: Number(values.maxRedemptions),
                  prefix: String(values.prefix ?? 'REDEEM'),
                } satisfies AdminCreateRedemptionBatchRequest);
                const codes = response.items.map((item: { code: string }) => item.code);
                setResultCodes(codes);
                setResultOpen(true);
                notify(`已生成 ${String(codes.length)} 个兑换码`, { type: 'success' });
              } catch (error) {
                const message =
                  error instanceof AdminApiError
                    ? error.message
                    : error instanceof Error
                      ? error.message
                      : '生成失败';
                notify(message, { type: 'error' });
              }
            }}
          >
            <TextInput source="packId" label="知识库 ID" validate={required()} fullWidth />
            <NumberInput source="count" label="生成数量" defaultValue={10} validate={required()} fullWidth />
            <NumberInput source="maxRedemptions" label="每码可兑次数" defaultValue={1} fullWidth />
            <TextInput source="prefix" label="码前缀" defaultValue="REDEEM" fullWidth />
          </SimpleForm>
        </Box>
      </Create>
      <RedemptionBatchResultDialog
        codes={resultCodes}
        onClose={() => {
          setResultOpen(false);
          redirect('list', 'redemption-codes');
        }}
        open={resultOpen}
      />
    </>
  );
}

interface PackRedemptionBatchFormProps {
  packId: string;
  onCreated: () => void;
}

export function PackRedemptionBatchForm(props: PackRedemptionBatchFormProps) {
  const notify = useNotify();
  const [count, setCount] = useState('10');
  const [maxRedemptions, setMaxRedemptions] = useState('1');
  const [prefix, setPrefix] = useState('REDEEM');
  const [busy, setBusy] = useState(false);
  const [resultCodes, setResultCodes] = useState<string[]>([]);
  const [resultOpen, setResultOpen] = useState(false);

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const response = await createRedemptionBatch({
        packId: props.packId,
        count: Number(count),
        maxRedemptions: Number(maxRedemptions),
        prefix,
      });
      const codes = response.items.map((item: { code: string }) => item.code);
      setResultCodes(codes);
      setResultOpen(true);
      notify(`已生成 ${String(codes.length)} 个兑换码`, { type: 'success' });
      props.onCreated();
    } catch (error) {
      const message =
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '生成失败';
      notify(message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <TextField label="生成数量" size="small" type="number" value={count} onChange={(e) => setCount(e.target.value)} sx={{ width: 120 }} />
        <TextField label="每码次数" size="small" type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} sx={{ width: 120 }} />
        <TextField label="前缀" size="small" value={prefix} onChange={(e) => setPrefix(e.target.value)} sx={{ width: 140 }} />
        <Button disabled={busy} onClick={() => void handleSubmit()} variant="contained">
          批量生成
        </Button>
      </Stack>
      <RedemptionBatchResultDialog codes={resultCodes} onClose={() => setResultOpen(false)} open={resultOpen} />
    </Box>
  );
}
