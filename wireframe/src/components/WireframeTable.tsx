type WireframeTableProps = {
  columns: string[]
  rows: Array<Array<string | JSX.Element>>
}

export function WireframeTable({ columns, rows }: WireframeTableProps) {
  return (
    <div className="table-wrap">
      <table className="wire-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
