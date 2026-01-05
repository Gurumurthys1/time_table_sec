import React, { useState, useEffect } from 'react';
import { BookOpen, User } from 'lucide-react';

const CourseSelector = ({ courses, selectedSubjects, onToggleSubject, preferredFaculties, onSetPreference }) => {
    // Group courses by Course Code or Name to show options
    // The API returns a flat list of slots. We need to find unique subjects.

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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
                Select Subjects ({selectedSubjects.length})
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
                {uniqueSubjects.map(subject => {
                    const isSelected = selectedSubjects.includes(subject);
                    const details = structure[subject];
                    const facultyList = Array.from(details.faculties);

                    return (
                        <div
                            key={subject}
                            className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{subject}</h3>
                                    <p className="text-sm text-gray-500">{details.code} • {details.credits} Credits</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleSubject(subject)}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                            </div>

                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-indigo-100">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center mb-1">
                                        <User className="w-3 h-3 mr-1" /> Preferred Faculty
                                    </label>
                                    <select
                                        className="w-full p-2 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={preferredFaculties[subject] || ""}
                                        onChange={(e) => onSetPreference(subject, e.target.value)}
                                    >
                                        <option value="">No Preference</option>
                                        {facultyList.map(f => (
                                            <option key={f} value={f}>{f}</option>
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
