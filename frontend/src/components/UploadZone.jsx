import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadPDF } from '../api';

const UploadZone = ({ onUploadSuccess }) => {
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

    return (
        <div className="w-full">
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

            {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center text-red-400 animate-fade-in">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
