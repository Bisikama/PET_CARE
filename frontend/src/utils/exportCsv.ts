export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

function escapeCsvCell(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  const str = String(raw);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Export rows to a UTF-8 BOM CSV file that opens cleanly in Excel with Vietnamese characters. */
export function exportToCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(c.value(row))).join(','),
  );
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
