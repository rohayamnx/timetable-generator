import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet, FileText, Download, FileDown } from 'lucide-react';
import { TimetableEntry } from '@/types/timetable';
import { exportToPDF, exportToExcel } from '@/lib/export-utils';
import { CalendarSettings } from '@/types/settings';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  settings: CalendarSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  settings,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Timetable
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* PDF Export Card */}
          <Card className="relative group hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <FileText className="h-5 w-5" />
                PDF Export
              </CardTitle>
              <CardDescription>
                Export your timetable as a PDF document with a clean, professional layout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Professional A4 landscape layout</li>
                  <li>High-quality print-ready format</li>
                  <li>Perfect for sharing and printing</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  exportToPDF(entries, settings);
                  onClose();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </CardFooter>
          </Card>

          {/* Excel Export Card */}
          <Card className="relative group hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <FileSpreadsheet className="h-5 w-5" />
                Excel Export
              </CardTitle>
              <CardDescription>
                Export your timetable as an Excel spreadsheet for easy editing and analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-green-50 rounded-lg p-4 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Editable spreadsheet format</li>
                  <li>Auto-formatted columns</li>
                  <li>Compatible with all spreadsheet software</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  exportToExcel(entries, settings);
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
