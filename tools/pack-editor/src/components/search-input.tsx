import type { ReactElement } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = '搜索…',
}: SearchInputProps): ReactElement {
  return (
    <div className="search-input-group">
      <input
        type="search"
        className="input search-input-field"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-clear-search"
          onClick={() => {
            onChange('');
          }}
        >
          清除
        </button>
      )}
    </div>
  );
}
