import "../style/DataTable.css";

/**
 * Generic admin data table.
 * columns: [{ key, label, render?(row) }]
 * rows: array of objects
 */
export default function DataTable({ columns, rows, loading = false, emptyText = "No records found." }) {
  if (loading) {
    return <div className="table-empty">Loading...</div>;
  }

  if (!rows || rows.length === 0) {
    return <div className="table-empty">{emptyText}</div>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row._id ?? row.id ?? i}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
