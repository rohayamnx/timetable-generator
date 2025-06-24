'use client';

import React, { useState } from 'react';
import TimetableForm from '@/components/timetable/timetable-form';
import TimetableView from '@/components/timetable/timetable-view';
import { TimetableEntry } from '@/types/timetable';
import { CalendarSettings } from '@/types/settings';

const DEFAULT_SETTINGS: CalendarSettings = {
  startTime: '08:00',
  endTime: '18:00',
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  timeFormat: 'hourly'
};

export default function Page() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | undefined>();
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);

  const handleAddEntry = (formData: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = {
      ...formData,
      id: Date.now().toString(),
    };
    setEntries([...entries, newEntry]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
  };

  const handleUpdateEntry = (updatedEntry: TimetableEntry) => {
    setEntries(entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    setEditingEntry(undefined);
  };

  const handleSettingsUpdate = (newSettings: CalendarSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Timetable Generator</h1>
        <p className="text-lg text-muted-foreground">
          Create and manage your timetable efficiently.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <TimetableForm 
            onSubmit={handleAddEntry}
            editingEntry={editingEntry}
            onUpdate={handleUpdateEntry}
            settings={settings}
            entries={entries}
          />
        </div>
        <div>
          <TimetableView 
            entries={entries}
            onDelete={handleDeleteEntry}
            onEdit={handleEditEntry}
            onSettingsChange={handleSettingsUpdate}
          />
        </div>
      </div>
    </div>
  );
}