import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DayOfWeek, TimeSlot, TimetableEntry } from '@/types/timetable';
import { CalendarSettings, TimeFormat } from '@/types/settings';

interface TimetableFormProps {
	onSubmit: (data: Omit<TimetableEntry, 'id'>) => void;
	onUpdate: (data: TimetableEntry) => void;
	editingEntry?: TimetableEntry;
	settings: CalendarSettings;
	entries: TimetableEntry[];
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

const TimetableForm: React.FC<TimetableFormProps> = ({
	onSubmit,
	editingEntry,
	onUpdate,
	settings,
	entries,
}) => {
	const [subject, setSubject] = useState('');
	const [location, setLocation] = useState('');
	const [lecturer, setLecturer] = useState('');
	const [day, setDay] = useState<DayOfWeek>(settings.workDays[0] as DayOfWeek);
	const [timeSlot, setTimeSlot] = useState<TimeSlot>({
		startTime: settings.startTime,
		endTime: settings.endTime,
	});

	useEffect(() => {
		if (editingEntry) {
			setSubject(editingEntry.subject);
			setLocation(editingEntry.location);
			setLecturer(editingEntry.lecturer);
			setDay(editingEntry.day);
			setTimeSlot({
				startTime: editingEntry.startTime,
				endTime: editingEntry.endTime,
			});
		}
	}, [editingEntry]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate time slot is within settings range
		if (timeSlot.startTime < settings.startTime || timeSlot.endTime > settings.endTime) {
			alert('Selected time slot must be within the working hours set in settings.');
			return;
		}

		// Check for overlapping entries
		const hasOverlap = entries.some(entry => 
			entry.day === day &&
			entry.id !== editingEntry?.id && // Exclude current editing entry
			((timeSlot.startTime >= entry.startTime && timeSlot.startTime < entry.endTime) ||
			 (timeSlot.endTime > entry.startTime && timeSlot.endTime <= entry.endTime) ||
			 (timeSlot.startTime <= entry.startTime && timeSlot.endTime >= entry.endTime))
		);

		if (hasOverlap) {
			const confirmOverlap = window.confirm(
				'There is already an entry scheduled for this time slot. Do you want to add this entry anyway?'
			);
			if (!confirmOverlap) {
				return;
			}
		}

		const formData = {
			subject,
			location,
			lecturer,
			day,
			startTime: timeSlot.startTime,
			endTime: timeSlot.endTime,
		};

		if (editingEntry) {
			onUpdate({ ...formData, id: editingEntry.id });
		} else {
			onSubmit(formData);
		}

		// Reset form
		setSubject('');
		setLocation('');
		setLecturer('');
		setDay(settings.workDays[0] as DayOfWeek);
		setTimeSlot({
			startTime: settings.startTime,
			endTime: settings.endTime,
		});
	};

	const availableTimeSlots = generateTimeSlots(settings.timeFormat, settings.startTime, settings.endTime);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{editingEntry ? 'Edit Timetable Entry' : 'Create Timetable Entry'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="day">Day</Label>
						<Select
							value={day}
							onValueChange={(value) => setDay(value as DayOfWeek)}
						>
							<SelectTrigger id="day" className="w-full bg-white">
								<SelectValue placeholder="Select a day" />
							</SelectTrigger>
							<SelectContent className="bg-white">
								{settings.workDays.map((day) => (
									<SelectItem key={day} value={day}>
										{day}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              className="bg-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              className="bg-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lecturer">Lecturer</Label>
            <Input
							id="lecturer"
							className="bg-white"
							value={lecturer}
							onChange={(e) => setLecturer(e.target.value)}
							placeholder="Enter lecturer name"
						/>
          </div>

					<div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={timeSlot.startTime}
                onValueChange={(value) =>
                  setTimeSlot((prev) => ({
                    startTime: value,
                    // If no end time is selected or end time is now invalid, set it to the next slot
                    endTime: !prev.endTime || value >= prev.endTime ? 
                      availableTimeSlots[availableTimeSlots.indexOf(value) + 1] || prev.endTime 
                      : prev.endTime
                  }))
                }
              >
                <SelectTrigger id="startTime" className="w-full bg-white">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {availableTimeSlots.slice(0, -1).map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
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
                value={timeSlot.endTime}
                onValueChange={(value) =>
                  setTimeSlot((prev) => ({ ...prev, endTime: value }))
                }
              >
                <SelectTrigger id="endTime" className="w-full bg-white">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {availableTimeSlots.slice(1).map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={time <= timeSlot.startTime} // Only prevent selecting end time before or equal to start time
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

					<div className="flex justify-end space-x-2">
						<Button type="submit" className="w-full md:w-auto">
							{editingEntry ? 'Update' : 'Create'}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default TimetableForm;