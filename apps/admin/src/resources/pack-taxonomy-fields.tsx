import { useEffect, useMemo, useState } from 'react';
import { SelectInput, useInput } from 'react-admin';
import type { AdminCatalogTaxonomyResponse } from '@remember/contracts';
import { fetchAdminCatalogTaxonomy } from '../api/catalog-taxonomy-api.js';

function useTaxonomyChoices() {
  const [taxonomy, setTaxonomy] = useState<AdminCatalogTaxonomyResponse | null>(null);

  useEffect(() => {
    void fetchAdminCatalogTaxonomy()
      .then(setTaxonomy)
      .catch(() => setTaxonomy(null));
  }, []);

  return taxonomy;
}

export function PackTaxonomyFields() {
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

  return (
    <>
      <SelectInput
        source="primaryNodeId"
        label="一级分类"
        choices={primaryChoices}
        fullWidth
        onChange={(event) => {
          primaryNodeIdField.onChange(event);
          secondaryNodeIdField.onChange('');
        }}
      />
      <SelectInput
        source="secondaryNodeId"
        label="二级分类"
        choices={secondaryChoices}
        disabled={secondaryChoices.length === 0}
        fullWidth
      />
      <SelectInput
        source="versionNodeId"
        label="教材版本"
        choices={versionChoices}
        fullWidth
      />
    </>
  );
}
