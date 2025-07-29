import React from 'react';

interface FileCardProps {
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    tags: string[];
}

const FileCard: React.FC<FileCardProps> = ({
    fileName,
    fileType,
    fileSize,
    uploadedAt,
    tags
}) => {
    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    return (
        <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
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
        </div>
    );
};

export default FileCard;
