import React, { useState } from 'react';
import { formatFileSize, getLocationPath } from '@/utils/api';
import ShareModal from './ShareModal';

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
    url?: string;
    owner?: {
        name: string;
        email: string;
    };
}

interface DashboardFileTableProps {
    files: FileData[];
    onDownload: (fileId: string, fileName: string) => void;
    onDelete: (fileId: string, fileName: string) => void;
    onRename: (fileId: string, newName: string) => void;
    onCopy: (fileId: string) => void;
    onPreview: (file: FileData) => void;
    onShare: (fileId: string) => void;
    onMove: (fileId: string, destinationFolderId: string) => void;
}

const DashboardFileTable: React.FC<DashboardFileTableProps> = ({
    files,
    onDownload,
    onDelete,
    onRename,
    onCopy,
    onPreview,
    onShare,
    onMove
}) => {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
        // Position it right at the button for Google Drive-like behavior
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
                setActiveShareSubmenu(null);
            }
        };

        // Also close when scrolling
        const handleScroll = () => {
            if (activeDropdown) {
                setActiveDropdown(null);
                setDropdownPosition(null);
                setActiveShareSubmenu(null);
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
    // State to track which share submenu is active
    const [activeShareSubmenu, setActiveShareSubmenu] = useState<string | null>(null);
    // State for share modal
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [activeFile, setActiveFile] = useState<FileData | null>(null);

    // Function to handle moving a file
    const handleMoveFile = (fileId: string) => {
        const destinationFolder = prompt("Enter destination folder ID:");
        if (destinationFolder) {
            onMove(fileId, destinationFolder);
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
                {/* Preview option */}
                <button
                    onClick={() => {
                        onPreview(file);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium">Preview</span>
                    <span className="ml-auto text-xs text-gray-400">Ctrl+Alt+P</span>
                </button>

                {/* Open in new tab option */}
                <button
                    onClick={() => {
                        if (file.url) {
                            window.open(file.url, '_blank');
                        }
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="font-medium">Open in new tab</span>
                </button>                {/* Download option */}
                <button
                    onClick={() => {
                        onDownload(file._id, file.originalname);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="font-medium">Download</span>
                </button>

                {/* Rename option */}
                <button
                    onClick={() => {
                        const newName = prompt('Enter new name:', file.originalname);
                        if (newName && newName !== file.originalname) {
                            onRename(file._id, newName);
                        }
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium">Rename</span>
                    <span className="ml-auto text-xs text-gray-400">Ctrl+Alt+E</span>
                </button>

                {/* Make a copy option */}
                <button
                    onClick={() => {
                        onCopy(file._id);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="font-medium">Make a copy</span>
                    <span className="ml-auto text-xs text-gray-400">Ctrl+C Ctrl+V</span>
                </button>

                {/* Share option with submenu */}
                <div className="relative share-submenu-wrapper">
                    <button
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 justify-between"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            // Toggle the submenu visibility by setting state
                            if (activeShareSubmenu === file._id) {
                                setActiveShareSubmenu(null);
                            } else {
                                setActiveShareSubmenu(file._id);
                            }
                        }}
                    >
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="font-medium">Share</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Share submenu - Floats to the left with fixed positioning */}
                    <div
                        className={`fixed z-[60] bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-56 ${activeShareSubmenu === file._id ? 'block' : 'hidden'}`}
                        style={{
                            left: `${dropdownPosition ? dropdownPosition.left - 260 : 0}px`,
                            top: `${dropdownPosition ? dropdownPosition.top - 10 : 0}px`
                        }}
                    >
                        <button
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Set active file and open share modal
                                setActiveFile(file);
                                setShareModalOpen(true);
                                // Call the onShare function
                                onShare(file._id);
                                setActiveDropdown(null);
                                setActiveShareSubmenu(null);
                            }}
                        >
                            <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="font-medium">Share with others</span>
                        </button>

                        <button
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                                // Generate API link for file
                                const fileLink = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${file._id}/view`;
                                navigator.clipboard.writeText(fileLink);

                                // Visual feedback without alert
                                const toast = document.createElement('div');
                                toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded shadow-lg z-[100]';
                                toast.textContent = 'Link copied to clipboard!';
                                document.body.appendChild(toast);

                                // Remove toast after 3 seconds
                                setTimeout(() => {
                                    document.body.removeChild(toast);
                                }, 3000);

                                setActiveDropdown(null);
                                setActiveShareSubmenu(null);
                            }}
                        >
                            <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="font-medium">Copy link</span>
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Move to folder option */}
                <button
                    onClick={() => {
                        handleMoveFile(file._id);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">Move to folder</span>
                </button>

                {/* Move to trash option */}
                <button
                    onClick={() => {
                        onDelete(file._id, file.originalname);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium">Move to trash</span>
                    <span className="ml-auto text-xs text-gray-400">Delete</span>
                </button>
            </div>
        );
    };

    return (
        <>
            {/* Share Modal - rendered outside the table container so it doesn't interfere with table layout */}
            {activeFile && (
                <ShareModal
                    fileId={activeFile._id}
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    initialIsPublic={activeFile.isPublic}
                />
            )}

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Owner
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File size
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
                                    onClick={(e) => {
                                        // Double click to preview
                                        if ((e.target as Element).tagName !== 'BUTTON' && (e.target as Element).tagName !== 'svg') {
                                            onPreview(file);
                                        }
                                    }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-[#e6f5ee] text-[#18b26f] rounded-lg flex items-center justify-center">
                                                {getFileIcon(file.mimetype)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{file.originalname}</div>
                                                <div className="text-xs text-gray-500">{formatDateShort(file.updatedAt)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-[#18b26f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                {file.owner?.name ? file.owner.name.charAt(0).toUpperCase() : 'M'}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {file.owner?.name || 'Me'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{getLocationPath(file.path)}</div>
                                        <div className="text-xs text-gray-500">{file.isPublic ? 'Accessible to anyone' : 'Only you'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center justify-between">
                                            <span>{formatFileSize(file.size)}</span>
                                            <div className="relative">
                                                <button
                                                    className={`p-2 rounded-full hover:bg-gray-100 transition-all duration-200 ease-out ${hoveredRow === file._id ? 'opacity-100' : 'opacity-0'}`}
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
            </div>
        </>
    );
};

export default DashboardFileTable;
