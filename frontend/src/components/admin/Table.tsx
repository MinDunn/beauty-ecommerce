interface Column {
  header: string;
  key: string;
  className?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  selectable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (id: number) => void;
  onSelectAll?: (ids: number[]) => void;
  rowClassName?: (item: any) => string;
}

export const Table = ({ columns, data, selectable, selectedIds = [], onSelectionChange, onSelectAll, rowClassName }: TableProps) => {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-slate-900">
          <tr>
            {selectable && (
               <th className="px-6 py-4 border-b border-slate-800 w-12">
                  <input 
                    type="checkbox" 
                    checked={allSelected}
                    onChange={() => onSelectAll?.(allSelected ? [] : data.map(d => d.id || d.key))}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-900 transition-all cursor-pointer"
                  />
               </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-slate-700 font-bold text-lg">Chưa có dữ liệu</div>
                  <p className="text-slate-500 text-sm">Thông tin sẽ hiển thị khi có bản ghi mới được cập nhật.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const rowId = row.id || row.key;
              const isSelected = selectedIds.includes(rowId);
              
              return (
                <tr key={i} className={`hover:bg-slate-800/30 transition-colors group ${isSelected ? 'bg-primary-500/5' : ''} ${rowClassName ? rowClassName(row) : ''}`}>
                  {selectable && (
                    <td className="px-6 py-4 border-b border-transparent">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => onSelectionChange?.(rowId)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-slate-900 transition-all cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
