import { SaveButton } from 'react-admin';
import { useFormState } from 'react-hook-form';

/** 有改动才可保存。 */
export function PackSaveButton() {
  const { isDirty } = useFormState();
  return <SaveButton alwaysEnable={false} disabled={!isDirty} />;
}
