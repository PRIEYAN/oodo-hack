import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Empty } from './ui.jsx';

// columns: [{ key, header, render?(row), sortable?, className? }]
export function DataTable({ columns, rows, searchable = true, searchKeys, emptyMessage }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return rows;
    const keys = searchKeys || columns.map((c) => c.key);
    const q = query.toLowerCase();
    return rows.filter((r) =>
      keys.some((k) => String(getVal(r, k) ?? '').toLowerCase().includes(q))
    );
  }, [rows, query, columns, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = getVal(a, sortKey);
      const bv = getVal(b, sortKey);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    });
    if (sortDir === 'desc') copy.reverse();
    return copy;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {searchable && (
        <div className="relative mb-3 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-control border border-hairline bg-surface pl-9 pr-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      )}
      <div className="overflow-x-auto border border-hairline rounded-card bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => c.sortable !== false && toggleSort(c.key)}
                  className={`px-4 py-3 font-medium text-muted whitespace-nowrap ${
                    c.sortable !== false ? 'cursor-pointer select-none hover:text-ink' : ''
                  } ${c.className || ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {sortKey === c.key &&
                      (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row._id || i} className="border-b border-hairline last:border-0 hover:bg-bg/60">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-ink ${c.className || ''}`}>
                    {c.render ? c.render(row) : getVal(row, c.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <Empty message={emptyMessage} />}
      </div>
    </div>
  );
}

function getVal(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
