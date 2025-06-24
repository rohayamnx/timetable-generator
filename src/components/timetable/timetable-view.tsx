import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TimetableModal from './timetable-modal';
import { TimetableEntry } from '@/types/timetable';
import { SettingsModal } from './settings-modal';
import { CalendarSettings, TimeFormat } from '@/types/settings';
import { Settings } from 'lucide-react';

interface TimetableViewProps {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
  onSettingsChange?: (settings: CalendarSettings) => void;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  startTime: '08:00',
  endTime: '18:00',
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  timeFormat: 'hourly'
};

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

// Helper function to count slots between times
const getSlotSpan = (startTime: string, endTime: string, timeSlots: string[]): number => {
  const startIndex = timeSlots.indexOf(startTime);
  const endIndex = timeSlots.indexOf(endTime);
  if (startIndex === -1 || endIndex === -1) return 1; // Fallback to prevent errors
  return Math.max(1, endIndex - startIndex); // Ensure minimum span of 1
};

const TimetableView: React.FC<TimetableViewProps> = ({ entries, onEdit, onDelete, onSettingsChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);

  const handleSettingsChange = (newSettings: CalendarSettings) => {
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekly Schedule</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Full View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto overflow-y-auto">
            <Table className="w-full table-fixed">
              <TableHeader>
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
                            className="p-0 relative"
                            colSpan={slot.span}
                          >
                            <div className="m-1 p-2 h-full bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-sm transition-colors">
                              <div className="font-medium text-blue-700">{slot.entry.subject}</div>
                              <div className="text-blue-600 text-xs">{slot.entry.location}</div>
                              <div className="text-blue-600 text-xs">{slot.entry.lecturer}</div>
                              <div className="text-blue-500 text-xs mt-1 flex justify-between items-center">
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => onEdit(slot.entry)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs px-2 hover:bg-blue-200"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => onDelete(slot.entry.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs px-2 text-red-600 hover:bg-red-100"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        );
                      }

                      return !isOccupied ? (
                        <TableCell 
                          key={`${day}-${time}`} 
                          className="p-0 border-r w-[140px] h-[100px]"
                        />
                      ) : null;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entries={entries}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsChange}
      />
    </>
  );
};

export default TimetableView;