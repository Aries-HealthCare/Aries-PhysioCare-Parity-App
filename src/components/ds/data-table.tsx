import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  className?: string;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, selectedKey, className }: DataTableProps<T>) {
  return (
    <div className={cn('rounded-3xl border border-border overflow-hidden bg-card', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 font-outfit font-bold text-xs uppercase tracking-wide text-muted-foreground', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-t border-border',
                    onRowClick && 'cursor-pointer hover:bg-muted/40',
                    selectedKey === key && 'bg-primary/5'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 align-middle', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
