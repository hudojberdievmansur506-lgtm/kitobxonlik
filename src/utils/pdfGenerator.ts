import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestResult } from '../types';

/**
 * Generates and downloads a beautiful PDF table of student quiz results
 */
export function exportResultsToPDF(results: TestResult[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Title section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55); // Dark gray
  doc.text('KITOBXONLIK TESTI NATIJALARI', 14, 15);

  // Subtitle/Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray
  const now = new Date().toLocaleString('uz-UZ');
  doc.text(`Yuklangan sana: ${now} | Jami natijalar soni: ${results.length}`, 14, 21);

  // Table rows map
  const tableData = results.map((r, index) => [
    (index + 1).toString(),
    r.familiyaIsm,
    r.kurs,
    `${r.daraja} - ${r.talimYonalishi}`,
    r.jamiSavollar.toString(),
    r.togriJavoblar.toString(),
    `${r.foiz}%`,
    new Date(r.vaqt).toLocaleDateString('uz-UZ') + ' ' + new Date(r.vaqt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  ]);

  autoTable(doc, {
    startY: 26,
    head: [[
      'T/r', 
      'Talaba familiyasi va ismi', 
      'Kurs', 
      'Yo‘nalishi va Darajasi', 
      'Savollar', 
      'To‘g‘ri', 
      'Natija (%)', 
      'Sana / Vaqt'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [31, 41, 55], // Cool charcoal primary slate
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left'
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 15 },
      3: { cellWidth: 70 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 25, fontStyle: 'bold' },
      7: { cellWidth: 35 }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  });

  // Save PDF
  doc.save(`kitobxonlik_testi_natijalari_${Date.now()}.pdf`);
}
