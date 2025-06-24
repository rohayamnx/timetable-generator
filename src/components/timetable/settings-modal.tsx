import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarSettings, TimeFormat } from '@/types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalendarSettings;
  onSave: (settings: CalendarSettings) => void;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const generateTimeSlots = (timeFormat: TimeFormat) => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    if (timeFormat === 'half-hour') {
      slots.push(`${hourStr}:30`);
    }
  }
  return slots;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const timeSlots = generateTimeSlots(localSettings.timeFormat);

  const handleTimeFormatChange = (value: TimeFormat) => {
    const newTimeSlots = generateTimeSlots(value);

    // Adjust start and end times to nearest valid slots in new format
    const newStartTime =
      newTimeSlots.find((t) => t >= localSettings.startTime) || newTimeSlots[0];
    const newEndTime =
      newTimeSlots.find((t) => t >= localSettings.endTime) ||
      newTimeSlots[newTimeSlots.length - 1];

    setLocalSettings((prev) => ({
      ...prev,
      timeFormat: value,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
  };

  const handleSave = () => {
    // Validate at least one working day is selected
    if (localSettings.workDays.length === 0) {
      alert('Please select at least one working day');
      return;
    }

    // Validate end time is after start time
    if (localSettings.endTime <= localSettings.startTime) {
      alert('End time must be after start time');
      return;
    }

    onSave(localSettings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="timeFormat">Time Format</Label>
            <Select
              value={localSettings.timeFormat}
              onValueChange={handleTimeFormatChange}
            >
              <SelectTrigger id="timeFormat" className="bg-white">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="hourly">Hourly (1:00)</SelectItem>
                <SelectItem value="half-hour">Half-hour (0:30)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={localSettings.startTime}
                onValueChange={(value) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    startTime: value,
                    endTime:
                      value >= prev.endTime
                        ? timeSlots[timeSlots.indexOf(value) + 1] || prev.endTime
                        : prev.endTime,
                  }))
                }
              >
                <SelectTrigger id="startTime" className="bg-white">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {timeSlots.slice(0, -1).map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={time >= localSettings.endTime}
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select
                value={localSettings.endTime}
                onValueChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, endTime: value }))
                }
              >
                <SelectTrigger id="endTime" className="bg-white">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {timeSlots.slice(1).map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={time <= localSettings.startTime}
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={
                    localSettings.workDays.includes(day) ? 'default' : 'outline'
                  }
                  className="w-full"
                  onClick={() =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      workDays: prev.workDays.includes(day)
                        ? prev.workDays.filter((d) => d !== day)
                        : [...prev.workDays, day],
                    }))
                  }
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
