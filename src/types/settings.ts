export type TimeFormat = 'hourly' | 'half-hour';

export interface CalendarSettings {
    startTime: string;
    endTime: string;
    workDays: string[];
    timeFormat: TimeFormat;
}

export interface TimetableSettings {
    calendar: CalendarSettings;
}
