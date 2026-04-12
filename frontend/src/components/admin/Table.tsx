interface Column {
  header: string;
  key: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
}

export const Table = ({ columns, data }: TableProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
    <table className="w-full text-left border-separate border-spacing-0">
      <thead className="sticky top-0 z-10 bg-slate-900">
        <tr>
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
            <td colSpan={columns.length} className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-slate-700 font-bold text-lg">Chưa có dữ liệu</div>
                <p className="text-slate-500 text-sm">Thông tin sẽ hiển thị khi có bản ghi mới được cập nhật.</p>
              </div>
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
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

