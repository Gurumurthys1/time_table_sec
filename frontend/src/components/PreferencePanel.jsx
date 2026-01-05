import React from 'react';
import { Calendar } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PreferencePanel = ({ leaveDay, setLeaveDay, onGenerate }) => {
    return (
        <div className="w-full max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Weekly Leave Preference
            </h2>

            <div className="flex flex-wrap gap-3 mb-6">
                {DAYS.map(day => (
                    <button
                        key={day}
                        onClick={() => setLeaveDay(day)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${leaveDay === day
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <button
                onClick={onGenerate}
                disabled={!leaveDay}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Generate Timetable
            </button>
        </div>
    );
};

export default PreferencePanel;
