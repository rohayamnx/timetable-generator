import React, { createContext, useContext, useState, ReactNode } from 'react';

type TimetableContextType = {
  timetableEntries: any[];
  setTimetableEntries: React.Dispatch<React.SetStateAction<any[]>>;
};

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export const TimetableProvider = ({ children }: { children: ReactNode }) => {
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  return (
    <TimetableContext.Provider value={{ timetableEntries, setTimetableEntries }}>
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) throw new Error('useTimetable must be used within a TimetableProvider');
  return context;
};