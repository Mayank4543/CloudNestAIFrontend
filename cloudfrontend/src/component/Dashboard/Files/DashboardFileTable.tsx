import React, { useState } from 'react';
import { formatFileSize } from '@/utils/api';
import ShareModal from './ShareModal';
import SummarizeModal from './SummarizeModal';
import ScanWithAI from './ScanWithAI';
import SensitiveDataAlert from './SensitiveDataAlert';

interface ScanResult {
    containsSensitiveData: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    sensitiveDataTypes: string[];
    details: string[];
    recommendation: string;
}

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
    relevanceScore?: number; // For AI search results
    starred?: boolean; // Added for star functionality
}

interface DashboardFileTableProps {
    files: FileData[];
    onDownload: (fileId: string, fileName: string) => void;
    onDelete: (fileId: string, fileName: string) => void;
    // These props are defined but not currently used in the component
    // Commenting them out to fix the unused variables warning
    // onRename: (fileId: string, newName: string) => void;
    // onCopy: (fileId: string) => void;
    onPreview: (file: FileData) => void;
    onShare: (fileId: string) => void;
    // onMove: (fileId: string, destinationFolderId: string) => void;
    onToggleStar?: (fileId: string) => void; // Add this prop
    searchType?: 'keyword' | 'semantic'; // Add search type prop
}

const DashboardFileTable: React.FC<DashboardFileTableProps> = ({
    files,
    onDownload,
    onDelete,
    // onRename,
    // onCopy,
    onPreview,
    onShare,
    // onMove,
    onToggleStar,
    searchType = 'keyword'
}) => {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [summarizeModalOpen, setSummarizeModalOpen] = useState<boolean>(false);
    const [selectedFileForSummary, setSelectedFileForSummary] = useState<FileData | null>(null);
    const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);
    const [selectedFileForScan, setSelectedFileForScan] = useState<FileData | null>(null);
    const [showSensitiveAlert, setShowSensitiveAlert] = useState<boolean>(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    // Handler for scan completion
    const handleScanComplete = (result: ScanResult) => {
        setScanResult(result);
        setScanModalOpen(false); // Close scan modal
        setShowSensitiveAlert(true); // Show results alert
    };

    const handleCloseScanModal = () => {
        setScanModalOpen(false);
        setSelectedFileForScan(null);
    };

    const handleCloseSensitiveAlert = () => {
        setShowSensitiveAlert(false);
        setScanResult(null);
        setSelectedFileForScan(null);
    };

    // Helper function to copy private link
    const copyPrivateLink = async (file: FileData) => {
        try {
            // Generate proxy link like in ShareModal
            const filename = file.filename || file.originalname || 'unknown_file';
            let link = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/proxy/${encodeURIComponent(filename)}`;

            // Handle different file types like in ShareModal
            const mimetype = file.mimetype || '';
            if (mimetype.includes('presentation') || mimetype.includes('powerpoint') || filename.endsWith('.ppt') || filename.endsWith('.pptx')) {
                link = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link)}`;
            }

            await navigator.clipboard.writeText(link);
            showToast('Private Link Copied', 'success');
            setActiveDropdown(null);
            setActiveShareSubmenu(null);
        } catch (error) {
            console.error('Error copying link:', error);
            showToast('Error copying link', 'error');
        }
    };

    // Helper function to show toast messages
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-gray-800' : 'bg-red-800';
        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded shadow-lg z-[100]`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    };

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
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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

                {/* Star/Unstar option */}
                {onToggleStar && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleStar(file._id);
                            setActiveDropdown(null);
                            setActiveShareSubmenu(null);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        {file.starred ? (
                            <>
                                <svg className="w-4 h-4 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="font-medium">Remove from Starred</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span className="font-medium">Add to Starred</span>
                            </>
                        )}
                    </button>
                )}

                {/* Open in new tab option */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        if (file.url) {
                            window.open(file.url);
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
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
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
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                copyPrivateLink(file);
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

                {/* Summarise with AI option */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedFileForSummary(file);
                        setSummarizeModalOpen(true);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-medium">Summarise with AI</span>
                    <span className="ml-auto text-xs text-gray-400">AI</span>
                </button>

                {/* Scan with AI option */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedFileForScan(file);
                        setScanModalOpen(true);
                        setActiveDropdown(null);
                        setActiveShareSubmenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Scan with AI</span>
                    <span className="ml-auto text-xs text-gray-400">Privacy</span>
                </button>

                {/* Move to trash option */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
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

            {/* Summarize Modal */}
            <SummarizeModal
                file={selectedFileForSummary}
                isOpen={summarizeModalOpen}
                onClose={() => {
                    setSummarizeModalOpen(false);
                    setSelectedFileForSummary(null);
                }}
            />

            {/* Scan with AI Modal */}
            {selectedFileForScan && (
                <ScanWithAI
                    fileId={selectedFileForScan._id}
                    filename={selectedFileForScan.originalname}
                    onScanComplete={handleScanComplete}
                    onClose={handleCloseScanModal}
                    isOpen={scanModalOpen}
                />
            )}

            {/* Sensitive Data Alert Modal */}
            {scanResult && selectedFileForScan && (
                <SensitiveDataAlert
                    scanResult={scanResult}
                    filename={selectedFileForScan.originalname}
                    onProceedPublic={() => {
                        // For standalone scan, just show the result
                        showToast('Scan complete. Check the result above.', 'success');
                        handleCloseSensitiveAlert();
                    }}
                    onKeepPrivate={() => {
                        showToast('File scan completed.', 'success');
                        handleCloseSensitiveAlert();
                    }}
                    onClose={handleCloseSensitiveAlert}
                    isOpen={showSensitiveAlert}
                />
            )}

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tags
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
                                {searchType === 'semantic' && (
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        AI Score
                                    </th>
                                )}
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center max-w-xs">
                                            {file.tags && file.tags.length > 0 ? (
                                                <span
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                                    title={`Tag: ${file.tags[0]}${file.tags.length > 1 ? ` (+${file.tags.length - 1} more)` : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                    }}
                                                >
                                                    <svg className="w-3 h-3 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                    </svg>
                                                    {file.tags[0].length > 15 ? `${file.tags[0].substring(0, 15)}...` : file.tags[0]}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic flex items-center">
                                                    <svg className="w-4 h-4 mr-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    No tags
                                                </span>
                                            )}
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
                                        {/* <div className="text-sm text-gray-900">{getLocationPath(file.path)}</div> */}
                                        <div className="text-xs text-gray-500">{file.isPublic ? 'Accessible to anyone' : 'Only you'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center justify-between">
                                            <span>
                                                {file.size && file.size > 0 ? formatFileSize(file.size) : 'N/A'}
                                            </span>
                                            <div className="relative">
                                                <button
                                                    className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 ease-out opacity-100"
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
                                    {searchType === 'semantic' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {file.relevanceScore ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {Math.round(file.relevanceScore * 100)}% match
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    {/* Table Header for Mobile */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">File Name</h3>
                    </div>

                    {files.map((file) => (
                        <div
                            key={file._id}
                            className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                                if ((e.target as Element).tagName !== 'BUTTON' && (e.target as Element).tagName !== 'svg' && !(e.target as Element).closest('button')) {
                                    onPreview(file);
                                }
                            }}
                        >
                            <div className="flex items-start justify-between">
                                {/* Left Column - File Info */}
                                <div className="flex-1 min-w-0">
                                    {/* File Name and Icon */}
                                    <div className="flex items-center mb-2">
                                        <div className="flex-shrink-0 h-8 w-8 bg-[#e6f5ee] text-[#18b26f] rounded flex items-center justify-center mr-3">
                                            {getFileIcon(file.mimetype)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">{file.originalname}</div>
                                        </div>
                                    </div>

                                    {/* Single Tag Row with # */}
                                    <div className="mb-3">
                                        {file.tags && file.tags.length > 0 ? (
                                            <span
                                                className="inline-flex items-center text-sm font-bold text-blue-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                }}
                                            >
                                                #{file.tags[0].length > 15 ? `${file.tags[0].substring(0, 15)}...` : file.tags[0]}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">No tags</span>
                                        )}
                                    </div>

                                    {/* File Details - Only time */}
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span>{formatDateShort(file.updatedAt)}</span>
                                        {searchType === 'semantic' && file.relevanceScore && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <span className="text-green-600 font-medium">
                                                    {Math.round(file.relevanceScore * 100)}% match
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Three Dots Menu */}
                                <div className="flex-shrink-0 ml-4">
                                    <button
                                        className="p-2 rounded hover:bg-gray-100 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDropdown(file._id, e);
                                        }}
                                        title="More actions"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                                        </svg>
                                    </button>
                                    {/* Dropdown Menu - Same component works for both views */}
                                    <DropdownMenu file={file} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DashboardFileTable;
