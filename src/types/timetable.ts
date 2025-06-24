export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
    startTime: string;
    endTime: string;
}

export interface TimetableEntry {
    id: string;
    subject: string;
    location: string;
    lecturer: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
}
