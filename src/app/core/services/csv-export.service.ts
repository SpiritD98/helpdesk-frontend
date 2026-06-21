import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  private readonly BOM = '\uFEFF';

  export(data: Record<string, unknown>[], filename: string): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => this.escapeValue(row[h])).join(',')
    );
    const csv = this.BOM + headers.join(',') + '\n' + rows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private escapeValue(v: unknown): string {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }
}
