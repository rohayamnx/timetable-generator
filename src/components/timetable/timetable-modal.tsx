import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimetableEntry } from '@/types/timetable';
import { exportToPDF, exportToExcel } from '@/lib/export-utils';
import { CalendarSettings, TimeFormat } from '@/types/settings';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  settings: CalendarSettings;
}

const generateTimeSlots = (timeFormat: TimeFormat, startTime: string, endTime: string) => {
  const slots: string[] = [];
  const [startHour] = startTime.split(':').map(Number);
  const [endHour, startMinute = 0] = endTime.split(':').map(Number);
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    if (hour === endHour && startMinute === 0) {
      break;
    }
    slots.push(`${hourStr}:00`);
    if (timeFormat === 'half-hour') {
      if (hour === endHour && startMinute < 30) {
        continue;
      }
      slots.push(`${hourStr}:30`);
    }
  }
  return slots;
};

// Helper function to count slots between times
const getSlotSpan = (startTime: string, endTime: string, timeSlots: string[]): number => {
  const startIndex = timeSlots.indexOf(startTime);
  const endIndex = timeSlots.indexOf(endTime);
  if (startIndex === -1 || endIndex === -1) return 1;
  return Math.max(1, endIndex - startIndex);
};

// Helper function to get time range display
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

const TimetableModal: React.FC<TimetableModalProps> = ({
  isOpen,
  onClose,
  entries,
  settings,
}) => {
  // Get time slots based on settings
  const timeSlots = generateTimeSlots(settings.timeFormat, settings.startTime, settings.endTime);

  // Group entries by day and starting time
  const schedule = settings.workDays.reduce((acc, day) => {
    acc[day] = {};
    entries.forEach(entry => {
      if (entry.day === day && 
          entry.startTime >= settings.startTime && 
          entry.startTime < settings.endTime) {
        acc[day][entry.startTime] = {
          entry,
          span: getSlotSpan(entry.startTime, entry.endTime, timeSlots)
        };
      }
    });
    return acc;
  }, {} as Record<string, Record<string, { entry: TimetableEntry; span: number }>>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col bg-white">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Full Schedule View</DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => exportToPDF(entries, settings)}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
              >
                Export to PDF
              </Button>
              <Button
                onClick={() => exportToExcel(entries, settings)}
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
              >
                Export to Excel
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="min-w-[1000px] max-w-full">
            <Table className="w-full table-fixed">
              <TableHeader className="sticky top-0 z-20">
                <TableRow>
                  <TableHead className="w-[140px] bg-gray-100 sticky left-0 z-30">Days</TableHead>
                  {timeSlots.map((time, index) => (
                    <TableHead 
                      key={time} 
                      className="w-[140px] text-center bg-gray-50 border-r whitespace-nowrap px-2"
                    >
                      {getTimeRangeDisplay(time, settings.timeFormat, timeSlots)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.workDays.map(day => (
                  <TableRow key={day}>
                    <TableCell className="w-[140px] font-medium bg-gray-50 sticky left-0 z-10">
                      {day}
                    </TableCell>
                    {timeSlots.map((time, index) => {
                      const slot = schedule[day]?.[time];
                      const isOccupied = Object.values(schedule[day] || {}).some(
                        ({ entry, span }) => {
                          const startIndex = timeSlots.indexOf(entry.startTime);
                          return index >= startIndex && index < startIndex + span;
                        }
                      );

                      if (slot) {
                        return (
                          <TableCell
                            key={`${day}-${time}`}
                            className="p-1"
                            colSpan={slot.span}
                          >
                            <div className="p-2 h-full bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-sm transition-colors">
                              <div className="font-medium text-blue-700">{slot.entry.subject}</div>
                              <div className="text-blue-600 text-xs">{slot.entry.location}</div>
                              <div className="text-blue-600 text-xs">{slot.entry.lecturer}</div>
                            </div>
                          </TableCell>
                        );
                      }

                      return !isOccupied ? (
                        <TableCell 
                          key={`${day}-${time}`} 
                          className="p-1 border-r w-[140px] h-[100px]"
                        />
                      ) : null;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableModal;
