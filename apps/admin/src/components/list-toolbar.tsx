import { CreateButton, TopToolbar } from 'react-admin';

export function ListCreateActions({ label }: { label: string }) {
  return (
    <TopToolbar>
      <CreateButton label={label} />
    </TopToolbar>
  );
}

export function EmptyListActions() {
  return <TopToolbar />;
}
