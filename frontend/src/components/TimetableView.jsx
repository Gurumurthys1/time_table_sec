import React from 'react';
import { Clock } from 'lucide-react';

const TimetableView = ({ timetable, ghostSubjects = [], allGhostData = null }) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = [
        "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
        "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
        "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00",
        "17:00 - 18:00", "18:00 - 19:00"
    ];

    // Helper to format time strings for comparison
    const parseTime = (timeStr) => {
        if (!timeStr) return -1;
        const [start] = timeStr.split(' - ');
        return parseInt(start.replace(':', ''), 10);
    };

    // Pre-process timetable for faster lookup
    const scheduleMap = {};
    timetable.forEach(slot => {
        if (!scheduleMap[slot.day]) scheduleMap[slot.day] = {};
        const startTimeKey = parseTime(slot.time);
        scheduleMap[slot.day][startTimeKey] = { ...slot, type: 'booked' };
    });

    // Pre-process ghosts
    const ghostMap = {};
    if (allGhostData && ghostSubjects.length > 0) {
        ghostSubjects.forEach(subj => {
            if (allGhostData[subj]) {
                allGhostData[subj].forEach(slot => {
                    if (!ghostMap[slot.day]) ghostMap[slot.day] = {};
                    const tKey = parseTime(slot.time);
                    // If conflict with existing booking, mark as collision?
                    // For now, simple overlay prioritizing booking, or showing partial?
                    // Let's just store it.
                    if (!ghostMap[slot.day][tKey]) ghostMap[slot.day][tKey] = [];
                    ghostMap[slot.day][tKey].push({ ...slot, subject: subj, type: 'ghost' });
                });
            }
        });
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center">
                <span className="p-1.5 bg-indigo-500/20 rounded-lg mr-2 border border-indigo-500/30">
                    <Clock className="w-5 h-5 text-indigo-400" />
                </span>
                My Timetable
            </h2>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-800 shadow-2xl">
                <table className="w-full border-collapse bg-gray-900 text-sm text-center">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-gray-800 bg-gray-950/50 text-gray-400 font-bold sticky left-0 z-10 w-32 border-r">
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" /> Time
                                </div>
                            </th>
                            {days.map(day => (
                                <th key={day} className="p-4 border-b border-gray-800 bg-gray-950/50 text-indigo-300 font-bold tracking-wider uppercase text-xs">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {times.map((time, index) => {
                            const timeKey = parseTime(time);
                            return (
                                <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="p-3 border-r border-b border-gray-800 font-mono text-gray-500 text-xs bg-gray-950/30 font-medium">
                                        {time}
                                    </td>
                                    {days.map(day => {
                                        const bookedSlot = scheduleMap[day]?.[timeKey];
                                        const ghosts = ghostMap[day]?.[timeKey];

                                        // Render logic
                                        let cellContent = null;
                                        let cellClass = "";

                                        if (bookedSlot) {
                                            cellContent = (
                                                <div className="h-full w-full p-2 flex flex-col justify-center items-center">
                                                    <span className="font-bold text-white text-sm line-clamp-1">{bookedSlot.course_name}</span>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-white/80 font-mono">{bookedSlot.course_code}</span>
                                                        <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-white/80 font-mono">{bookedSlot.venue}</span>
                                                    </div>
                                                    <span className="text-[10px] text-white/60 mt-1 italic">{bookedSlot.faculty}</span>
                                                </div>
                                            );
                                            // Generate consistent colors based on Subject Name hash or similar
                                            // For now, use a default vibrant gradient
                                            cellClass = "bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500/50 hover:to-indigo-600 shadow-lg transform hover:scale-[1.02] transition-transform z-10 relative";
                                        } else if (ghosts && ghosts.length > 0) {
                                            // Ghost Slot
                                            cellContent = (
                                                <div className="flex flex-col gap-1 items-center justify-center h-full opacity-100">
                                                    {ghosts.map((g, idx) => (
                                                        <span key={idx} className="text-xs font-bold text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded border border-emerald-500/30 animate-pulse">
                                                            {g.subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                            cellClass = "bg-gray-900/30 relative border-dashed border-emerald-500/30 hover:bg-emerald-900/10";
                                        } else {
                                            // Empty
                                            cellContent = <span className="text-gray-800 text-xs select-none">.</span>;
                                            cellClass = "text-gray-800";
                                        }

                                        return (
                                            <td key={day} className={`border-b border-r border-gray-800 h-24 p-1 relative group ${cellClass}`}>
                                                {cellContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableView;
