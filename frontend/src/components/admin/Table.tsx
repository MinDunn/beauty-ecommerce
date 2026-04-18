interface Column {
  header: string;
  key: string;
  className?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  rowClassName?: (item: any) => string;
}

export const Table = ({ columns, data, rowClassName }: TableProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
    <table className="w-full text-left border-separate border-spacing-0">
      <thead className="sticky top-0 z-10 bg-slate-900">
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={`px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 ${col.className || ''}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
              Trình quản lý đang trống...
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className={`hover:bg-slate-800/30 transition-colors group ${rowClassName ? rowClassName(row) : ''}`}>
              {columns.map((col) => (
                <td key={col.key} className={`px-6 py-4 text-sm text-slate-300 font-medium group-hover:text-white transition-colors ${col.className || ''}`}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

