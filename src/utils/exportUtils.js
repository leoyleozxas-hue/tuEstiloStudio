// src/utils/exportUtils.js

/**
 * Genera y descarga un archivo CSV con formato UTF-8
 * @param {string} filename - Nombre del archivo (ej: 'reporte.csv')
 * @param {Array<string>} headers - Lista de nombres de columnas
 * @param {Array<Array<any>>} rows - Matriz con los datos de las filas
 */
export function exportToCSV(filename, headers, rows) {
  if (!rows || !rows.length) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(value => {
        const strVal = String(value ?? '').replace(/"/g, '""');
        return strVal.includes(',') || strVal.includes('\n') || strVal.includes('"') 
          ? `"${strVal}"` 
          : strVal;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}