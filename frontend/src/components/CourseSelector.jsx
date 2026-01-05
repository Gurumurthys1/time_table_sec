import React, { useState, useEffect } from 'react';
import { BookOpen, User, AlertCircle } from 'lucide-react';

const CourseSelector = ({ courses, selectedSubjects, compatibleSubjects, onToggleSubject, preferredFaculties, onSetPreference }) => {
    // Group courses by Course Code or Name to show options
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
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid gap-4 md:grid-cols-2">
                {uniqueSubjects.map(subject => {
                    const isSelected = selectedSubjects.includes(subject);
                    const details = structure[subject];
                    const facultyList = Array.from(details.faculties);

                    // Intelligent Availability Check
                    const isCompatible = compatibleSubjects
                        ? compatibleSubjects.includes(subject)
                        : true;

                    // In dark mode, we dim opacity heavily for incompatible items
                    const isDisabled = !isCompatible && !isSelected;

                    return (
                        <div
                            key={subject}
                            className={`p-4 rounded-xl border transition-all relative group ${isSelected
                                    ? 'border-indigo-500 bg-indigo-900/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                    : isDisabled
                                        ? 'border-gray-800 bg-gray-900/30 opacity-30 grayscale'
                                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/80'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className={`font-bold line-clamp-1 transition-colors ${isSelected ? 'text-indigo-200' : isDisabled ? 'text-gray-600' : 'text-gray-200 group-hover:text-white'
                                        }`}>{subject}</h3>
                                    <p className="text-sm text-gray-500">{details.code} • {details.credits} Credits</p>

                                    {isDisabled && (
                                        <div className="flex items-center text-xs text-red-500/80 mt-2 font-medium animate-pulse">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Conflict
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleSubject(subject)}
                                    // Use accent-color for standard checkbox or custom style
                                    className={`w-5 h-5 rounded cursor-pointer transition-all 
                                        ${isDisabled
                                            ? 'opacity-50 cursor-not-allowed accent-gray-700'
                                            : 'accent-indigo-500 hover:accent-indigo-400'}`}
                                />
                            </div>

                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-indigo-500/20 animate-fade-in">
                                    <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wide flex items-center mb-1">
                                        <User className="w-3 h-3 mr-1" /> Preferred Faculty
                                    </label>
                                    <select
                                        className="w-full p-2 text-sm border border-indigo-500/30 rounded-lg bg-black/40 text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-indigo-500/50 transition-colors"
                                        value={preferredFaculties[subject] || ""}
                                        onChange={(e) => onSetPreference(subject, e.target.value)}
                                    >
                                        <option value="" className="bg-gray-900">Any Available</option>
                                        {facultyList.map(f => (
                                            <option key={f} value={f} className="bg-gray-900">{f}</option>
                                        ))}
                                    </select>
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
