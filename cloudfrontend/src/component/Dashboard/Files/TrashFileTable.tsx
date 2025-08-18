import React, { useState } from 'react';
import { formatFileSize } from '@/utils/api';

interface FileData {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    userId: string;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    url?: string;
    owner?: {
        name: string;
        email: string;
    };
}

interface TrashFileTableProps {
    files: FileData[];
    onRestore: (fileId: string) => void;
    onPermanentDelete: (fileId: string, fileName: string) => void;
}

const TrashFileTable: React.FC<TrashFileTableProps> = ({
    files,
    onRestore,
    onPermanentDelete
}) => {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Format date for display
    const formatDateShort = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Toggle dropdown menu
    const toggleDropdown = (fileId: string, event: React.MouseEvent<HTMLButtonElement>) => {
        // If already open, close it
        if (activeDropdown === fileId) {
            setActiveDropdown(null);
            return;
        }

        // Get the position of the clicked button
        const rect = event.currentTarget.getBoundingClientRect();

        // Calculate position for the dropdown
        const left = rect.right - 240; // Position it relative to the right side of the button
        const top = rect.bottom + 5; // Position slightly below the button

        setDropdownPosition({ top, left });
        setActiveDropdown(fileId);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown && !(event.target as Element).closest('.menu-dropdown')) {
                setActiveDropdown(null);
                setDropdownPosition(null);
            }
        };

        // Also close when scrolling
        const handleScroll = () => {
            if (activeDropdown) {
                setActiveDropdown(null);
                setDropdownPosition(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [activeDropdown]);

    // State for dropdown position
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number, left: number } | null>(null);

    // Get file icon based on mimetype
    const getFileIcon = (mimetype: string) => {
        if (mimetype.includes('image')) {
            return (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else if (mimetype.includes('pdf')) {
            return (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        } else if (mimetype.includes('text') || mimetype.includes('document')) {
            return (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v1h8V6H6zm0 3v1h8V9H6zm0 3v1h5v-1H6z" clipRule="evenodd" />
                </svg>
            );
        } else if (mimetype.includes('video')) {
            return (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    // Dropdown menu component
    const DropdownMenu = ({ file }: { file: FileData }) => {
        if (activeDropdown !== file._id) return null;

        return (
            <div
                className="menu-dropdown fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-56 overflow-hidden"
                style={{ top: `${dropdownPosition?.top}px`, left: `${dropdownPosition?.left}px` }}
            >
                {/* Restore option */}
                <button
                    onClick={() => {
                        onRestore(file._id);
                        setActiveDropdown(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium">Restore</span>
                </button>

                {/* Permanent delete option */}
                <button
                    onClick={() => {
                        onPermanentDelete(file._id, file.originalname);
                        setActiveDropdown(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium">Delete permanently</span>
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="w-full overflow-x-auto" style={{ maxWidth: '100%' }}>
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                Deleted On
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                File size
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {files.map((file) => (
                            <tr
                                key={file._id}
                                className={`hover:bg-gray-50 transition-colors ${hoveredRow === file._id ? 'bg-gray-50' : ''}`}
                                onMouseEnter={() => setHoveredRow(file._id)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-[#f5e6e6] text-[#b21818] rounded-lg flex items-center justify-center">
                                            {getFileIcon(file.mimetype)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{file.originalname}</div>
                                            <div className="text-xs text-gray-500">{file.filename}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{formatDateShort(file.deletedAt || file.updatedAt)}</div>
                                    <div className="text-xs text-gray-500">
                                        {file.deletedAt ? `Expires in ${Math.max(1, 30 - Math.floor((new Date().getTime() - new Date(file.deletedAt).getTime()) / (1000 * 60 * 60 * 24)))} days` : 'Unknown'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {file.size && file.size > 0 ? formatFileSize(file.size) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onRestore(file._id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Restore
                                        </button>
                                        <div className="relative">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 ease-out"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleDropdown(file._id, e);
                                                }}
                                                title="More actions"
                                            >
                                                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                                                </svg>
                                            </button>
                                            {/* Dropdown Menu */}
                                            <DropdownMenu file={file} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                {/* Table Header for Mobile */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deleted Files</h3>
                </div>

                <div className="overflow-y-auto max-h-[70vh]">
                    {files.map((file) => (
                        <div
                            key={file._id}
                            className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                {/* Left Column - File Info */}
                                <div className="flex-1 min-w-0 mr-4">
                                    {/* File Name and Icon */}
                                    <div className="flex items-center mb-3">
                                        <div className="flex-shrink-0 h-10 w-10 bg-[#f5e6e6] text-[#b21818] rounded-lg flex items-center justify-center mr-3">
                                            {getFileIcon(file.mimetype)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">{file.originalname}</div>
                                            <div className="text-xs text-gray-500 truncate">{file.filename}</div>
                                        </div>
                                    </div>

                                    {/* File Details */}
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Deleted:</span> {formatDateShort(file.deletedAt || file.updatedAt)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Expires:</span> {file.deletedAt ? `${Math.max(1, 30 - Math.floor((new Date().getTime() - new Date(file.deletedAt).getTime()) / (1000 * 60 * 60 * 24)))} days` : 'Unknown'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Size:</span> {file.size && file.size > 0 ? formatFileSize(file.size) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Actions */}
                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => onRestore(file._id)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                                    >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => onPermanentDelete(file._id, file.originalname)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                    >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrashFileTable;
