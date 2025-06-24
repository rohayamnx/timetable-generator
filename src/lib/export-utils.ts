import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { DayOfWeek, TimetableEntry } from '@/types/timetable';
import { CalendarSettings, TimeFormat } from '@/types/settings';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const generateTimeSlots = (timeFormat: TimeFormat, startTime: string, endTime: string) => {
  const slots: string[] = [];
  const [startHour] = startTime.split(':').map(Number);
  const [endHour, endMinute = 0] = endTime.split(':').map(Number);
  
  for (let hour = startHour; hour < endHour; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    if (timeFormat === 'half-hour') {
      slots.push(`${hourStr}:30`);
    }
  }
  // Only add the end hour if it's not exactly on the hour
  if (endMinute > 0) {
    const hourStr = endHour.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    if (timeFormat === 'half-hour' && endMinute >= 30) {
      slots.push(`${hourStr}:30`);
    }
  }
  return slots;
};

const getTimeRangeDisplay = (time: string, timeFormat: TimeFormat, timeSlots: string[]): string => {
  const [hour, minute = '00'] = time.split(':');
  const currentHour = parseInt(hour);
  const nextHour = (currentHour + 1).toString().padStart(2, '0');
  
  // Get the next time slot if it exists
  const currentIndex = timeSlots.indexOf(time);
  const nextTime = timeSlots[currentIndex + 1];

  // For the last slot or when there's no next time
  if (!nextTime || currentIndex === timeSlots.length - 1) {
    return `${time}-${nextHour}:${minute}`;
  }

  return `${time}-${nextTime}`;
};

const getSlotSpan = (startTime: string, endTime: string, timeSlots: string[]): number => {
  const startIndex = timeSlots.indexOf(startTime);
  const endIndex = timeSlots.indexOf(endTime);
  if (startIndex === -1 || endIndex === -1) return 1;
  return Math.max(1, endIndex - startIndex);
};

// Add color schemes for different slots
interface SlotColor {
  background: [number, number, number];
  border: [number, number, number];
  text: [number, number, number];
}

const slotColors: SlotColor[] = [
  {
    background: [219, 234, 254], // Light blue
    border: [191, 219, 254],
    text: [37, 99, 235],        // Blue
  },
  {
    background: [254, 226, 226], // Light red
    border: [254, 202, 202],
    text: [220, 38, 38],        // Red
  },
  {
    background: [220, 252, 231], // Light green
    border: [187, 247, 208],
    text: [22, 163, 74],        // Green
  },
  {
    background: [254, 243, 199], // Light yellow
    border: [253, 230, 138],
    text: [217, 119, 6],        // Yellow
  },
  {
    background: [237, 233, 254], // Light purple
    border: [221, 214, 254],
    text: [109, 40, 217],       // Purple
  }
];

export const exportToPDF = (entries: TimetableEntry[], settings: CalendarSettings) => {
  // Create new PDF in A4 landscape
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const timeSlots = generateTimeSlots(settings.timeFormat, settings.startTime, settings.endTime);
  
  // A4 dimensions in mm (297 x 210 for landscape)
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  const usableWidth = pageWidth - (2 * margin);
  const usableHeight = pageHeight - (2 * margin);

  // Calculate dimensions
  const dayColumnWidth = 25;
  const timeColumnWidth = (usableWidth - dayColumnWidth) / timeSlots.length;
  const rowHeight = (usableHeight - 25) / (settings.workDays.length + 1); // +1 for header

  // Add title with background
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Weekly Timetable Schedule', pageWidth / 2, 13, { align: 'center' });

  // Add date
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  const today = new Date().toLocaleDateString();
  doc.text(`Generated on: ${today}`, pageWidth - margin - 2, 8, { align: 'right' });

  // Start position for the grid
  const startY = margin + 15;
  let currentY = startY;

  // Draw header row
  doc.setFillColor(243, 244, 246); // Light gray background
  doc.rect(margin, currentY, usableWidth, rowHeight, 'F');
  
  // Days column header
  doc.setTextColor(31, 41, 55); // Dark text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Days', margin + 4, currentY + 7);

  // Time slots headers
  timeSlots.forEach((time, index) => {
    const x = margin + dayColumnWidth + (timeColumnWidth * index);
    const timeRange = getTimeRangeDisplay(time, settings.timeFormat, timeSlots);
    doc.text(timeRange, x + 2, currentY + 7, {
      maxWidth: timeColumnWidth - 4
    });
  });

  currentY += rowHeight;

  // Keep track of used colors for each unique subject
  const subjectColors = new Map<string, SlotColor>();
  let nextColorIndex = 0;

  // Draw day rows
  settings.workDays.forEach((day, dayIndex) => {
    // Day column
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, currentY, dayColumnWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(day, margin + 4, currentY + 7);

    // Time slots
    timeSlots.forEach((time, index) => {
      const x = margin + dayColumnWidth + (timeColumnWidth * index);
      const entry = entries.find(e => e.day === day && e.startTime === time);
      
      if (entry) {
        const span = getSlotSpan(entry.startTime, entry.endTime, timeSlots);
        const cellWidth = timeColumnWidth * span;

        // Get or assign color for this subject
        if (!subjectColors.has(entry.subject)) {
          subjectColors.set(entry.subject, slotColors[nextColorIndex % slotColors.length]);
          nextColorIndex++;
        }
        const colors = subjectColors.get(entry.subject)!;
        
        // Draw entry with assigned color
        doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        doc.rect(x, currentY, cellWidth, rowHeight, 'F');
        doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        doc.rect(x, currentY, cellWidth, rowHeight);
        
        // Add entry text with subject-specific color
        doc.setFontSize(8);
        const textX = x + 3;
        let textY = currentY + 5;
        
        // Subject - Bold and colored
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(entry.subject, textX, textY, {
          maxWidth: cellWidth - 6
        });
        
        // Location and lecturer - Normal weight, dark gray
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        textY += 5;
        doc.text(entry.location, textX, textY, {
          maxWidth: cellWidth - 6
        });
        
        textY += 5;
        doc.text(entry.lecturer, textX, textY, {
          maxWidth: cellWidth - 6
        });
      }
    });

    currentY += rowHeight;
  });

  // Draw outer border with shadow effect
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(margin, startY, usableWidth, currentY - startY);
  
  // Add subtle grid lines
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.1);
  
  // Vertical lines
  for (let i = 0; i <= timeSlots.length; i++) {
    const x = margin + dayColumnWidth + (timeColumnWidth * i);
    doc.line(x, startY, x, currentY);
  }
  
  // Horizontal lines
  for (let i = 0; i <= settings.workDays.length + 1; i++) {
    const y = startY + (rowHeight * i);
    doc.line(margin, y, margin + usableWidth, y);
  }

  // Save the PDF
  const date = new Date().toISOString().split('T')[0];
  doc.save(`weekly-schedule-${date}.pdf`);
};

export const exportToExcel = (entries: TimetableEntry[], settings: CalendarSettings) => {
  const timeSlots = generateTimeSlots(settings.timeFormat, settings.startTime, settings.endTime);
  
  // Create header row with time ranges
  const headers = ['Day', ...timeSlots.map(time => 
    getTimeRangeDisplay(time, settings.timeFormat, timeSlots)
  )];
  
  // Create data rows
  const rows = settings.workDays.map(day => {
    const rowData: Record<string, string> = { Day: day };
    timeSlots.forEach(time => {
      const entry = entries.find(e => e.day === day && e.startTime === time);
      if (entry) {
        const timeRange = getTimeRangeDisplay(time, settings.timeFormat, timeSlots);
        rowData[timeRange] = [
          entry.subject,
          `Location: ${entry.location}`,
          `Lecturer: ${entry.lecturer}`
        ].join('\\n');
      } else {
        const timeRange = getTimeRangeDisplay(time, settings.timeFormat, timeSlots);
        rowData[timeRange] = '';
      }
    });
    return rowData;
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows, { 
    header: headers,
  });
  
  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Day
    ...timeSlots.map(() => ({ wch: 25 })) // Time slots
  ];
  worksheet['!cols'] = columnWidths;

  // Set row heights
  worksheet['!rows'] = Array(rows.length + 1).fill({ hpt: 80 }); // Set all rows to height 80

  // Apply styles
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell_address]) continue;
      
      // Add cell styling
      worksheet[cell_address].s = {
        font: {
          name: 'Arial',
          sz: 10,
          color: { rgb: R === 0 ? '000000' : '333333' }
        },
        alignment: {
          vertical: 'top',
          horizontal: 'left',
          wrapText: true
        },
        fill: {
          fgColor: { rgb: R === 0 ? 'F3F4F6' : 'FFFFFF' }
        },
        border: {
          top: { style: 'thin', color: { rgb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          left: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } }
        }
      };
      
      // Special styling for day column
      if (C === 0) {
        worksheet[cell_address].s.font.bold = true;
        worksheet[cell_address].s.fill = {
          fgColor: { rgb: 'F9FAFB' }
        };
      }
    }
  }
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Schedule');
  
  // Save the Excel file
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `weekly-schedule-${date}.xlsx`);
};
