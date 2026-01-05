import React from 'react';
import { Calendar, Play } from 'lucide-react';

const PreferencePanel = ({ leaveDay, setLeaveDay, onGenerate }) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
        <div className="h-full flex flex-col">
            {/* Leave Day Card */}
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800 mb-6">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-violet-400" /> Preferred Leave Day
                </label>
                <div className="relative">
                    <select
                        className="w-full appearance-none p-3 pl-4 bg-black/40 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow cursor-pointer hover:border-gray-600"
                        value={leaveDay}
                        onChange={(e) => setLeaveDay(e.target.value)}
                    >
                        <option value="" className="bg-gray-900">No Preference (Any Day)</option>
                        {days.map(d => (
                            <option key={d} value={d} className="bg-gray-900">{d}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    * We'll try to keep this day free. Minimum classes otherwise.
                </p>
            </div>

            {/* Generate Button */}
            <button
                onClick={onGenerate}
                className="group w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center relative overflow-hidden"
            >
                <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -translate-x-full -skew-x-12"></span>
                <Play className="w-5 h-5 mr-2 fill-current" />
                GENERATE SCHEDULE
            </button>
        </div>
    );
};

export default PreferencePanel;
