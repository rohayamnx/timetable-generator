import React, { useState } from 'react';

const Form: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [subject, setSubject] = useState('');
    const [location, setLocation] = useState('');
    const [lecturer, setLecturer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ startDate, endDate, subject, location, lecturer });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                    type="datetime-local"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                    required
                />
            </div>
            <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                    type="datetime-local"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                    required
                />
            </div>
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                    required
                />
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location/Class</label>
                <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                    required
                />
            </div>
            <div>
                <label htmlFor="lecturer" className="block text-sm font-medium text-gray-700">Lecturer/Teacher</label>
                <input
                    type="text"
                    id="lecturer"
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                    required
                />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Generate Timetable</button>
        </form>
    );
};

export default Form;