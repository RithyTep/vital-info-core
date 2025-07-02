
export const printData = (data: any[], title: string, columns: string[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableRows = data.map(item => {
    const cells = columns.map(col => `<td class="border border-gray-300 px-4 py-2">${item[col] || ''}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const tableHeaders = columns.map(col => `<th class="border border-gray-300 px-4 py-2 bg-gray-100">${col}</th>`).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { text-align: left; }
          .header { text-align: center; margin-bottom: 20px; }
          .date { text-align: right; margin-bottom: 10px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HMS - CHAMRONGRITH CLINIC</h1>
          <h2>${title}</h2>
        </div>
        <div class="date">Printed on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
