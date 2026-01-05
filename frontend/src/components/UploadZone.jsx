import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { uploadPDF } from '../api';

const UploadZone = ({ onUploadSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const data = await uploadPDF(file);
            // Simulate a small delay for better UX feel of "processing"
            setTimeout(() => {
                onUploadSuccess(data.courses);
                setLoading(false);
            }, 800);
        } catch (err) {
            console.error(err);
            setError("Failed to process file. Ensure it's a valid PDF.");
            setLoading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 group
          ${isDragActive
                        ? 'border-indigo-400 bg-indigo-900/20 scale-[1.02]'
                        : 'border-gray-800 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-900/60'
                    }
        `}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <input {...getInputProps()} />

                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                    {loading ? (
                        <div className="animate-pulse">
                            <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mb-4" />
                            <p className="text-indigo-300 font-medium">Analyzing document structure...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`p-5 rounded-full mb-2 transition-transform duration-500 ${isDragActive ? 'scale-110 bg-indigo-500/20' : 'bg-gray-800 group-hover:bg-indigo-900/30'}`}>
                                <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-indigo-300' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                            </div>

                            <div>
                                <p className="text-xl font-bold text-gray-200 mb-2">
                                    {isDragActive ? "Drop PDF file here" : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-sm text-gray-500">Supported Format: PDF (Max 10MB)</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-xl flex items-center gap-3 animate-slide-up">
                    <div className="bg-red-500/10 p-2 rounded-full">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
