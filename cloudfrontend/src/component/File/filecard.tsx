import React, { useState } from 'react';
import axios from 'axios';

interface DeleteResponse {
    success: boolean;
    message: string;
}

interface FileCardProps {
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    tags: string[];
    onDelete?: (fileId: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({
    fileId,
    fileName,
    fileType,
    fileSize,
    uploadedAt,
    tags,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    // Handle file deletion
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
            return;
        }

        try {
            setIsDeleting(true);
            setError(null);

            const response = await axios.delete<DeleteResponse>(`https://cloudnestaibackend.onrender.com/api/files/${fileId}`);

            if (response.data.success) {
                // Call the parent component's onDelete callback
                if (onDelete) {
                    onDelete(fileId);
                }
            } else {
                setError(response.data.message || 'Failed to delete file');
            }
        } catch (err) {
            console.error('Error deleting file:', err);
            setError('Failed to delete file. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
                    {error}
                </div>
            )}
            <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-800 truncate">{fileName}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {fileType}
                    </span>
                </div>
                <div className="text-gray-600 text-sm mb-4">
                    <p>{formatFileSize(fileSize)} • Uploaded on {uploadedAt}</p>
                </div>
            </div>
            <div className="px-6 pt-2 pb-4">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    >
                        #{tag}
                    </span>
                ))}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`flex items-center text-sm font-medium px-3 py-1.5 rounded
                        ${isDeleting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'}
                    `}
                >
                    {isDeleting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FileCard;
