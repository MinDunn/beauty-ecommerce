type TableProps = {
  columns: string[];
  data: any[];
};

export const Table = ({ columns, data }: TableProps) => (
  <table className="w-full bg-white rounded shadow">
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col} className="p-2 text-left">{col}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.length === 0 ? (
        <tr>
          <td colSpan={columns.length} className="p-4 text-center text-gray-500">
            Không có dữ liệu
          </td>
        </tr>
      ) : (
        data.map((row, i) => (
          <tr key={i} className="border-t">
            {columns.map((_, idx) => (
              <td key={idx} className="p-2">{Object.values(row)[idx] as any}</td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  </table>
);
