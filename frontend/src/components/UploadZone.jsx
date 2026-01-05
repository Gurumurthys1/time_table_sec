import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Type, Clipboard } from 'lucide-react';
import { uploadPDF, uploadText } from '../api';

const UploadZone = ({ onUploadSuccess }) => {
    const [mode, setMode] = useState('upload'); // 'upload' or 'paste'
    const [pastedText, setPastedText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    const processFile = async (file) => {
        if (file.type !== 'application/pdf') {
            setError("Please upload a PDF file.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await uploadPDF(file);
            onUploadSuccess(data.courses);
        } catch (err) {
            setError("Failed to process file. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasteProcess = async () => {
        if (!pastedText.trim()) {
            setError("Please paste some text first.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await uploadText(pastedText);
            onUploadSuccess(data.courses);
        } catch (err) {
            setError("Failed to process text. Please ensure you copied correctly from the PDF.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Mode Switcher */}
            <div className="flex justify-center p-1 bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl w-fit mx-auto shadow-xl">
                <button
                    onClick={() => setMode('upload')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'upload'
                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Upload className="w-4 h-4" />
                    PDF Upload
                </button>
                <button
                    onClick={() => setMode('paste')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'paste'
                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Clipboard className="w-4 h-4" />
                    Paste Text
                </button>
            </div>

            {mode === 'upload' ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative group cursor-pointer
                        border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300
                        ${isDragging
                            ? 'border-indigo-500 bg-indigo-900/20 scale-[1.02]'
                            : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-900/40 bg-gray-900/20'
                        }
                    `}
                >
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className={`
                            p-4 rounded-full transition-all duration-500
                            ${isLoading ? 'bg-indigo-500/20 animate-pulse' : 'bg-gray-800 group-hover:bg-indigo-900/30'}
                        `}>
                            {isLoading ? (
                                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-lg font-medium text-gray-200">
                                {isLoading ? "Analyzing PDF..." : "Drop your Enrollment PDF here"}
                            </p>
                            <p className="text-sm text-gray-500">or click to browse</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    <div className="relative">
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Copy all text from your enrollment PDF and paste it here..."
                            className="w-full h-48 p-6 bg-gray-900/40 border-2 border-gray-800 rounded-3xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all custom-scrollbar resize-none text-sm leading-relaxed"
                        />
                        {pastedText && (
                            <button
                                onClick={() => setPastedText('')}
                                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 transition-colors"
                                title="Clear text"
                            >
                                <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                <span className="text-xs font-bold">CLEAR</span>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handlePasteProcess}
                        disabled={isLoading || !pastedText.trim()}
                        className={`
                            w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl
                            ${isLoading || !pastedText.trim()
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                            }
                        `}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Type className="w-5 h-5" />
                        )}
                        {isLoading ? "Analyzing Text..." : "Process Text Data"}
                    </button>
                    <p className="text-center text-xs text-gray-600">
                        Tip: Ctrl+A in your PDF, then Ctrl+C and Paste here.
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center text-red-400 animate-fade-in relative z-10">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
