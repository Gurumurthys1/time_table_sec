import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import UploadZone from './components/UploadZone.jsx';
import CourseSelector from './components/CourseSelector.jsx';
import PreferencePanel from './components/PreferencePanel.jsx';
import TimetableView from './components/TimetableView.jsx';
import { generateTimetable } from './api';

function App() {
  const [courses, setCourses] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [preferredFaculties, setPreferredFaculties] = useState({});
  const [leaveDay, setLeaveDay] = useState("");
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [status, setStatus] = useState(null); // 'loading', 'error', 'success', 'conflict'
  const [statusMessage, setStatusMessage] = useState("");

  const handleUploadSuccess = (data) => {
    setCourses(data);
    setSelectedSubjects([]);
    setGeneratedTimetable(null);
    setStatus(null);
  };

  const handleToggleSubject = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSetPreference = (subject, faculty) => {
    setPreferredFaculties(prev => ({
      ...prev,
      [subject]: faculty
    }));
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length < 2) {
      alert("Please select at least 2 subjects.");
      return;
    }

    setStatus('loading');
    setGeneratedTimetable(null);

    try {
      const result = await generateTimetable({
        selected_subjects: selectedSubjects,
        courses_data: courses, // Send full data back or relevant parts
        leave_day: leaveDay,
        preferred_faculties: preferredFaculties
      });

      if (result.status === 'success') {
        setGeneratedTimetable(result.timetable);
        setStatus('success');
      } else if (result.status === 'conflict') {
        setStatus('conflict');
        setStatusMessage(result.reason);
      } else {
        setStatus('error');
        setStatusMessage(result.reason || "Unknown error");
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage("Failed to connect to server.");
      console.error(err);
    }
  };

  // Render Logic
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">PlanWiz</h1>
              <p className="text-xs text-gray-500 font-medium">Intelligent Timetable Generator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12">

        {/* Step 1: Upload */}
        <section className="animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Transform Your Schedule
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              Upload your enrollment PDF to get started with AI-powered personalized timetabling.
            </p>
          </div>

          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Step 2: Selection */}
        {courses && (
          <section className="mt-12 animate-fade-in-up delay-100">
            <CourseSelector
              courses={courses}
              selectedSubjects={selectedSubjects}
              onToggleSubject={handleToggleSubject}
              preferredFaculties={preferredFaculties}
              onSetPreference={handleSetPreference}
            />

            <PreferencePanel
              leaveDay={leaveDay}
              setLeaveDay={setLeaveDay}
              onGenerate={handleGenerate}
            />
          </section>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="mt-12 flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium text-gray-600">Solving constraints...</p>
          </div>
        )}

        {/* Error/Conflict State */}
        {(status === 'conflict' || status === 'error') && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-red-700 mb-1">
              {status === 'conflict' ? 'Schedule Conflict' : 'Error'}
            </h3>
            <p className="text-red-600">{statusMessage}</p>
            {status === 'conflict' && (
              <p className="text-sm text-red-500 mt-2">Try changing your leave day or faculty preferences.</p>
            )}
          </div>
        )}

        {/* Step 3: Result */}
        {status === 'success' && generatedTimetable && (
          <section className="mt-12 animate-fade-in-up">
            <TimetableView timetable={generatedTimetable} />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 PlanWiz. Built with CSP & Backtracking.</p>
      </footer>
    </div>
  );
}

export default App;
