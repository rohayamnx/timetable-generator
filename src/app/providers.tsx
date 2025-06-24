import React, { createContext, useContext, useState } from 'react';

const TimetableContext = createContext();

export const TimetableProvider = ({ children }) => {
    const [timetableEntries, setTimetableEntries] = useState([]);

    const addEntry = (entry) => {
        setTimetableEntries((prevEntries) => [...prevEntries, entry]);
    };

    return (
        <TimetableContext.Provider value={{ timetableEntries, addEntry }}>
            {children}
        </TimetableContext.Provider>
    );
};

export const useTimetable = () => {
    return useContext(TimetableContext);
};