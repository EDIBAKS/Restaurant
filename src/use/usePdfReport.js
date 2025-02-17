import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function usePdfReport() {
  const generateReport = ({ 
    title = 'Report', 
    metadata = {}, 
    tableHeaders = [], 
    tableData = [], 
    filename = 'report.pdf' 
  }) => {
    const doc = new jsPDF();

    // Report Title
    doc.setFontSize(18);
    doc.text(title, 14, 15);

    // Dynamic Metadata (Date, User, etc.)
    doc.setFontSize(12);
    let y = 25;
    Object.entries(metadata).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, y);
      y += 10;
    });

    // Generate Table
    if (tableHeaders.length && tableData.length) {
      autoTable(doc, {
        startY: y,
        head: [tableHeaders],
        body: tableData,
      });
    }

    // Save PDF
    doc.save(filename);
  };

  return { generateReport };
}
