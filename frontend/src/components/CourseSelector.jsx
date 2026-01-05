import React, { useState, useEffect } from 'react';
import { BookOpen, User, AlertCircle, Check } from 'lucide-react';

const CourseSelector = ({ courses, selectedSubjects, compatibleSubjects, onToggleSubject, preferredFaculties, onSetPreference }) => {
    const [uniqueSubjects, setUniqueSubjects] = useState([]);
    const [structure, setStructure] = useState({});

    useEffect(() => {
        if (!courses) return;

        const subjs = {};
        courses.forEach(c => {
            if (!subjs[c.course_name]) {
                subjs[c.course_name] = {
                    code: c.course_code,
                    credits: c.credits,
                    faculties: new Set()
                };
            }
            subjs[c.course_name].faculties.add(c.faculty);
        });

        setUniqueSubjects(Object.keys(subjs));
        setStructure(subjs);
    }, [courses]);

    return (
        <div className="w-full">
            <div className="grid gap-4 md:grid-cols-2">
                {uniqueSubjects.map(subject => {
                    const isSelected = selectedSubjects.includes(subject);
                    const details = structure[subject];
                    const facultyList = Array.from(details.faculties);

                    // Intelligent Availability Check
                    const isCompatible = compatibleSubjects
                        ? compatibleSubjects.includes(subject)
                        : true;

                    // Disabled if not compatible AND not already selected
                    const isDisabled = !isCompatible && !isSelected;

                    return (
                        <div
                            key={subject}
                            className={`p-4 rounded-xl border transition-all duration-300 relative group overflow-hidden ${isSelected
                                    ? 'border-indigo-500 bg-indigo-900/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                    : isDisabled
                                        ? 'border-gray-800 bg-gray-900/30 opacity-40 grayscale'
                                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/80'
                                }`}
                        >
                            {/* Glowing effect for selected */}
                            {isSelected && <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-xl -mr-10 -mt-10 rounded-full pointer-events-none"></div>}

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div className="flex-1 pr-3">
                                    <h3 className={`font-bold text-base line-clamp-1 transition-colors ${isDisabled ? 'text-gray-500' : 'text-gray-100'}`}>
                                        {subject}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
                                        {details.code} <span className="text-gray-700 mx-1">•</span> {details.credits} Credits
                                    </p>

                                    {isDisabled && (
                                        <div className="flex items-center text-xs text-red-500/80 mt-2 font-medium bg-red-950/30 w-fit px-2 py-1 rounded">
                                            <AlertCircle className="w-3 h-3 mr-1.5" />
                                            Config Clash
                                        </div>
                                    )}
                                </div>

                                <label className="relative flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onToggleSubject(subject)}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : isDisabled
                                                ? 'border-gray-700 bg-gray-800'
                                                : 'border-gray-600 bg-transparent group-hover:border-gray-400'
                                        }`}>
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </label>
                            </div>

                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-indigo-500/20 animate-fade-in relative z-10">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center mb-1.5">
                                        <User className="w-3 h-3 mr-1.5 text-indigo-400" /> Preferred Faculty
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-2 text-sm text-gray-200 border border-indigo-500/30 rounded-lg bg-gray-950 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                                            value={preferredFaculties[subject] || ""}
                                            onChange={(e) => onSetPreference(subject, e.target.value)}
                                        >
                                            <option value="" className="bg-gray-900">Any Faculty</option>
                                            {facultyList.map(f => (
                                                <option key={f} value={f} className="bg-gray-900">{f}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseSelector;
