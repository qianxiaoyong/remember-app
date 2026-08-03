import type { StoryReadingContent, StoryTier } from '@remember/contracts';
import { useFieldArray, type Control, type FieldPath, type UseFormRegister } from 'react-hook-form';
import type { ReactElement } from 'react';

const tierOptions: StoryTier[] = ['high', 'mid', 'low'];

interface StorySidebarEditorProps {
  register: UseFormRegister<StoryReadingContent>;
  control: Control<StoryReadingContent>;
}

export function StorySidebarEditor({
  register,
  control,
}: StorySidebarEditorProps): ReactElement {
  const sidebar = useFieldArray({ control, name: 'sidebar' });

  return (
    <div className="edit-subsection">
      <div className="edit-subsection-head">
        <span className="edit-subsection-title">Sidebar · 词表</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            sidebar.append({
              vocabId: '',
              headword: '',
              ipa: '',
              pos: '',
              definitionZh: '',
              tier: 'high',
            });
          }}
        >
          + 添加词条
        </button>
      </div>
      {sidebar.fields.length === 0 ? (
        <p className="field-helper">暂无 sidebar 词条；正文 word run 引用前需先添加。</p>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table data-table-compact">
            <thead>
              <tr>
                <th>vocabId</th>
                <th>headword</th>
                <th>ipa</th>
                <th>pos</th>
                <th>definitionZh</th>
                <th>tier</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sidebar.fields.map((field, index) => (
                <tr key={field.id}>
                  <td>
                    <input
                      {...register(`sidebar.${String(index)}.vocabId` as FieldPath<StoryReadingContent>)}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(`sidebar.${String(index)}.headword` as FieldPath<StoryReadingContent>)}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(`sidebar.${String(index)}.ipa` as FieldPath<StoryReadingContent>)}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(`sidebar.${String(index)}.pos` as FieldPath<StoryReadingContent>)}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <input
                      {...register(
                        `sidebar.${String(index)}.definitionZh` as FieldPath<StoryReadingContent>,
                      )}
                      className="input input-sm"
                    />
                  </td>
                  <td>
                    <select
                      {...register(`sidebar.${String(index)}.tier` as FieldPath<StoryReadingContent>)}
                      className="select input-sm"
                    >
                      {tierOptions.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        sidebar.remove(index);
                      }}
                    >
                      删
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
