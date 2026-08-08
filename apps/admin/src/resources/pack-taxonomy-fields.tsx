import { useEffect, useMemo, useState } from 'react';
import { SelectInput, useInput } from 'react-admin';
import Grid from '@mui/material/Grid2';
import type { AdminCatalogTaxonomyResponse } from '@remember/contracts';
import { fetchAdminCatalogTaxonomy } from '../api/catalog-taxonomy-api.js';

function useTaxonomyChoices() {
  const [taxonomy, setTaxonomy] = useState<AdminCatalogTaxonomyResponse | null>(null);

  useEffect(() => {
    void fetchAdminCatalogTaxonomy()
      .then(setTaxonomy)
      .catch(() => {
        setTaxonomy(null);
      });
  }, []);

  return taxonomy;
}

interface PackTaxonomyFieldsProps {
  compact?: boolean;
}

export function PackTaxonomyFields({ compact = false }: PackTaxonomyFieldsProps) {
  const taxonomy = useTaxonomyChoices();
  const { field: primaryNodeIdField } = useInput({ source: 'primaryNodeId' });
  const { field: secondaryNodeIdField } = useInput({ source: 'secondaryNodeId' });
  useInput({ source: 'versionNodeId' });

  const primaryChoices = useMemo(
    () => taxonomy?.primaries.map((node) => ({ id: node.id, name: node.label })) ?? [],
    [taxonomy],
  );

  const secondaryChoices = useMemo(() => {
    const primary = taxonomy?.primaries.find((node) => node.id === primaryNodeIdField.value);
    return primary?.children.map((node) => ({ id: node.id, name: node.label })) ?? [];
  }, [taxonomy, primaryNodeIdField.value]);

  const versionChoices = useMemo(
    () => taxonomy?.versions.map((node) => ({ id: node.id, name: node.label })) ?? [],
    [taxonomy],
  );

  const inputSize = compact ? 'small' : 'medium';

  const primarySelect = (
    <SelectInput
      source="primaryNodeId"
      label="一级分类"
      choices={primaryChoices}
      fullWidth
      size={inputSize}
      onChange={(event) => {
        primaryNodeIdField.onChange(event);
        secondaryNodeIdField.onChange('');
      }}
    />
  );

  const secondarySelect = (
    <SelectInput
      source="secondaryNodeId"
      label="二级分类"
      choices={secondaryChoices}
      disabled={secondaryChoices.length === 0}
      fullWidth
      size={inputSize}
    />
  );

  const versionSelect = (
    <SelectInput
      source="versionNodeId"
      label="页内分类"
      choices={versionChoices}
      emptyText="全部（不限页内分类）"
      fullWidth
      size={inputSize}
    />
  );

  if (!compact) {
    return (
      <>
        {primarySelect}
        {secondarySelect}
        {versionSelect}
      </>
    );
  }

  return (
    <Grid container spacing={1.5} sx={{ width: '100%' }}>
      <Grid size={{ xs: 12, md: 4 }}>{primarySelect}</Grid>
      <Grid size={{ xs: 12, md: 4 }}>{secondarySelect}</Grid>
      <Grid size={{ xs: 12, md: 4 }}>{versionSelect}</Grid>
    </Grid>
  );
}
