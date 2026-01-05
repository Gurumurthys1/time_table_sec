import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadPDF } from '../api';

const UploadZone = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const processFile = async (file) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const data = await uploadPDF(file);
            onUploadSuccess(data.courses);
        } catch (err) {
            setError('Failed to process PDF. Please try again.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${isDragging
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".pdf"
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <FileText className="w-12 h-12 text-indigo-500 mb-3" />
                        <p className="text-gray-600 font-medium">Processing enrollment PDF...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <Upload className={`w-12 h-12 mb-3 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <p className="text-lg font-semibold text-gray-700">
                            {isDragging ? 'Drop it here!' : 'Drag & Drop Enrollment PDF'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default UploadZone;
