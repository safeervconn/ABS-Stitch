export interface CSVColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (item: T) => string | number;
}

export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const headers = columns.map(col => escapeCSVValue(col.label)).join(',');

  const rows = data.map(item => {
    return columns.map(col => {
      let value: any;

      if (col.format) {
        value = col.format(item);
      } else {
        value = item[col.key as keyof T];
      }

      if (value === null || value === undefined) {
        return '';
      }

      return escapeCSVValue(String(value));
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

function escapeCSVValue(value: string): string {
  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
