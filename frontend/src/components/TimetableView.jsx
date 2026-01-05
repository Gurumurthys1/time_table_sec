import React from 'react';
import { Calendar, Download } from 'lucide-react';

const TimetableView = ({ timetable }) => {
    if (!timetable || timetable.length === 0) return null;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = [
        "08:00 - 08:50", "09:00 - 09:50", "10:00 - 10:50",
        "11:00 - 11:50", "12:00 - 12:50", "13:00 - 13:50",
        "14:00 - 14:50", "15:00 - 15:50", "16:00 - 16:50"
    ];

    // Map timetable entries to grid
    const scheduleMap = {};
    timetable.forEach(entry => {
        // entry: { Day, Time: "08:00 - 08:50", ... }
        const key = `${entry.Day}-${entry.Time}`; // Need proper time matching
        // Actually, the Time from backend might be specific. We might need to map to slots.
        // For simplicity, let's just use the exact string from backend if it matches, 
        // or try to match start time.

        // Better approach: Grid by time slots.
        // If backend returns specific times like 08:00 - 08:50, we can match.
        scheduleMap[key] = entry;
    });

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                    Generated Timetable
                </h2>
                <button className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
                    <Download className="w-5 h-5 mr-2" /> Download CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 border-b-2 border-gray-100 text-left text-sm font-semibold text-gray-500 uppercase">Day / Time</th>
                            {times.map(t => (
                                <th key={t} className="p-3 border-b-2 border-gray-100 text-left text-sm font-semibold text-gray-500 whitespace-nowrap">
                                    {t.split(' - ')[0]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map(day => (
                            <tr key={day} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 border-b border-gray-100 font-medium text-gray-700">{day}</td>
                                {times.map(time => {
                                    // Loosely match time string
                                    // Backend returns "08:00 - 08:50" possibly.
                                    const entry = timetable.find(t => t.Day === day && t.Time.startsWith(time.split(' - ')[0]));

                                    return (
                                        <td key={time} className="p-2 border-b border-gray-100 border-l border-dashed border-gray-200 relative h-20">
                                            {entry ? (
                                                <div className="absolute inset-1 bg-indigo-50 border border-indigo-200 rounded-md p-2 flex flex-col justify-center">
                                                    <p className="text-xs font-bold text-indigo-900 line-clamp-2">{entry.Subject}</p>
                                                    <p className="text-xs text-indigo-600 mt-1">{entry.Faculty}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{entry.Slot}</p>
                                                </div>
                                            ) : null}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableView;
