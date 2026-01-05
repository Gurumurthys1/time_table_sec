import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const TimetableView = ({ timetable, ghostSubjects = [], allGhostData = null }) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
        "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
        "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
        "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
    ];

    // Helper: Normalize time to comparable string or check equality
    const isTimeMatch = (slotString, start, end) => {
        // slotString example: "08:00 - 09:00"
        // start/end example: "08:00", "09:00" OR "8:00", "9:00"

        // 1. Construct candidate strings
        const directMatch = `${start} - ${end}`;

        if (directMatch === slotString) return true;

        // 2. Handle normalization (strip leading zeros for robust check)
        // clean("08:00") -> "8:00"
        const clean = (t) => t.replace(/^0/, '');
        const cleanSlot = slotString.replace(/^0/, '').replace(/ - 0/g, ' - '); // overly simple, let's parse

        // 3. Robust Parse-Comparison
        // Compare integers: 8, 9, 13 (1pm) vs 1 (1am)
        try {
            const [slotStart, slotEnd] = slotString.split(' - ');
            const [h1, m1] = start.split(':').map(Number);
            const [h2, m2] = end.split(':').map(Number);
            const [sH, sM] = slotStart.split(':').map(Number);
            const [eH, eM] = slotEnd.split(':').map(Number);

            // Check Start Match
            // direct match or +12h match (1 -> 13)
            const startMatches = (h1 === sH && m1 === sM) || (h1 + 12 === sH && m1 === sM) || (h1 === sH + 12 && m1 === sM);

            // Check End Match
            const endMatches = (h2 === eH && m2 === eM) || (h2 + 12 === eH && m2 === eM) || (h2 === eH + 12 && m2 === eM);

            return startMatches && endMatches;

        } catch (e) {
            return false;
        }
    };

    // Helper: Find class for a specific slot
    const getClassForSlot = (day, time) => {
        // Priority 1: Scheduled Classes
        const scheduled = timetable.find(t =>
            t.day === day &&
            isTimeMatch(time, t.start_time, t.end_time)
        );
        if (scheduled) return { type: 'scheduled', ...scheduled };

        // Priority 2: Ghost Subjects (Interactive Mode)
        if (allGhostData && ghostSubjects.length > 0) {
            for (const subj of ghostSubjects) {
                const slots = allGhostData[subj] || [];

                const isGhostSlot = slots.some(slot =>
                    slot.day === day &&
                    isTimeMatch(time, slot.start_time, slot.end_time)
                );

                if (isGhostSlot) {
                    return { type: 'ghost', subject: subj };
                }
            }
        }

        return null;
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-gray-800 shadow-2xl bg-gray-900/50 backdrop-blur-sm">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-center border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 bg-gray-950/80 text-gray-400 font-semibold border-b border-gray-800 border-r min-w-[120px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" /> Time
                                </div>
                            </th>
                            {days.map(day => (
                                <th key={day} className="p-4 bg-gray-950/80 text-gray-200 font-bold border-b border-gray-800 min-w-[140px]">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((time, idx) => (
                            <tr key={idx} className="group hover:bg-gray-800/30 transition-colors">
                                <td className="p-3 font-medium text-gray-500 bg-gray-950/40 border-r border-gray-800 border-b border-gray-800/50 whitespace-nowrap text-xs">
                                    {time}
                                </td>
                                {days.map(day => {
                                    const cellData = getClassForSlot(day, time);

                                    // Base Cell Style
                                    let cellContent = null;
                                    let cellClasses = "border-b border-gray-800/50 border-r border-gray-800/30 p-1 h-20 transition-all duration-300 relative";

                                    if (cellData?.type === 'scheduled') {
                                        // Scheduled Class Style (Vibrant & Solid)
                                        cellClasses += " bg-indigo-900/40 hover:bg-indigo-900/60 cursor-pointer";
                                        cellContent = (
                                            <div className="h-full w-full rounded-lg p-2 flex flex-col justify-center items-center gap-1 border border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.15)] animate-fade-in">
                                                <span className="font-extrabold text-indigo-300 text-sm">{cellData.subject}</span>
                                                <span className="text-[10px] text-indigo-200/80 font-medium px-2 py-0.5 rounded-full bg-indigo-950/50 border border-indigo-500/20">
                                                    {cellData.venue}
                                                </span>
                                            </div>
                                        );
                                    } else if (cellData?.type === 'ghost') {
                                        // Ghost (Potential) Slot Style (Dashed & Glowing)
                                        cellClasses += " bg-emerald-900/20";
                                        cellContent = (
                                            <div className="h-full w-full rounded-lg border-2 border-dashed border-emerald-500/40 flex items-center justify-center animate-pulse">
                                                <span className="text-xs font-bold text-emerald-400">{cellData.subject}?</span>
                                            </div>
                                        );
                                    } else {
                                        // Empty Slot
                                        cellClasses += " hover:bg-gray-800/50";
                                    }

                                    return (
                                        <td key={`${day}-${time}`} className={cellClasses}>
                                            {cellContent}
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
