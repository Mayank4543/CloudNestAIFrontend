import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

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

interface FilePreviewModalProps {
    file: FileData | null;
    isOpen: boolean;
    onClose: () => void;
    onDownload?: (fileId: string, fileName: string) => void;
    onShare?: (fileId: string) => void;
    onDelete?: (fileId: string, fileName: string) => void;
    onRename?: (fileId: string, newName: string) => void;
    allFiles?: FileData[]; // Add this for navigation between files
    currentIndex?: number;  // Add this for current file index
    onNavigate?: (index: number) => void; // Add this for navigation
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    file,
    isOpen,
    onClose,
    onDelete,
    allFiles = [],
    currentIndex = -1,
    onNavigate
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && file) {
            generatePreviewUrl();
        }

        // Cleanup when modal closes
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen, file, previewUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    const generatePreviewUrl = useCallback(async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            // Always use proxy URL for reliable access that handles authentication and expired URLs
            const filename = file.filename || file.originalname || 'unknown_file';
            const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/proxy/${encodeURIComponent(filename)}`;

            // For different file types, we might need different handling
            const mimetype = file.mimetype || '';

            if (mimetype.includes('presentation') || mimetype.includes('powerpoint') || filename.endsWith('.ppt') || filename.endsWith('.pptx')) {
                // Use Office Online Viewer for PowerPoint files
                setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(baseUrl)}`);
            } else if (mimetype.includes('document') || mimetype.includes('msword') || filename.endsWith('.doc') || filename.endsWith('.docx')) {
                // Use Office Online Viewer for Word documents
                setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(baseUrl)}`);
            } else if (mimetype.includes('sheet') || mimetype.includes('excel') || filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
                // Use Office Online Viewer for Excel files
                setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(baseUrl)}`);
            } else if (mimetype.includes('image')) {
                // For images, fetch with authentication and create blob URL
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(baseUrl, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${response.status}`);
                    }

                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    setPreviewUrl(blobUrl);
                } catch (fetchError) {
                    console.error('Error fetching image:', fetchError);
                    // Fallback to direct URL without auth
                    setPreviewUrl(baseUrl);
                }
            } else if (mimetype.includes('video')) {
                // For videos, also fetch with authentication and create blob URL  
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(baseUrl, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch video: ${response.status}`);
                    }

                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    setPreviewUrl(blobUrl);
                } catch (fetchError) {
                    console.error('Error fetching video:', fetchError);
                    // Fallback to direct URL without auth
                    setPreviewUrl(baseUrl);
                }
            } else {
                // For other file types (PDFs, etc.), use proxy URL
                setPreviewUrl(baseUrl);
            }

        } catch (err) {
            console.error('Error generating preview URL:', err);
            setError('Unable to generate preview for this file');
        } finally {
            setLoading(false);
        }
    }, [file]);

    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowLeft' && onNavigate && typeof onNavigate === 'function' && currentIndex > 0) {
            e.preventDefault();
            onNavigate(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && onNavigate && typeof onNavigate === 'function' && currentIndex < allFiles.length - 1) {
            e.preventDefault();
            onNavigate(currentIndex + 1);
        } else if (e.key === 'Delete' && file && onDelete) {
            // Handle cut functionality with Delete key
            onDelete(file._id, file.originalname);
            onClose();
        }
    }, [onClose, onNavigate, currentIndex, allFiles, file, onDelete]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            document.body.classList.add('modal-open');
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'unset';
            document.body.classList.remove('modal-open');
        };
    }, [isOpen, currentIndex, allFiles, onNavigate, file, onDelete, handleKeyPress]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimetype: string) => {
        if (mimetype.includes('image')) {
            return (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else if (mimetype.includes('pdf')) {
            return (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        } else if (mimetype.includes('document') || mimetype.includes('text')) {
            return (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v1h8V6H6zm0 3v1h8V9H6zm0 3v1h5v-1H6z" clipRule="evenodd" />
                </svg>
            );
        } else if (mimetype.includes('video')) {
            return (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    const renderPreviewContent = () => {
        if (!file || !previewUrl) return null;

        const mimetype = file.mimetype || '';

        if (mimetype.includes('image')) {
            // Check if it's a blob URL (created from authenticated fetch)
            if (previewUrl.startsWith('blob:')) {
                return (
                    <Image
                        src={previewUrl}
                        alt={file.originalname}
                        width={800}
                        height={600}
                        className="max-w-[90%] max-h-[90%] object-contain shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-lg transition-all duration-500 hover:scale-[1.02]"
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setError('Unable to load image');
                            setLoading(false);
                        }}
                    />
                );
            } else {
                // Use Next.js Image for regular URLs
                return (
                    <Image
                        src={previewUrl}
                        alt={file.originalname}
                        width={800}
                        height={600}
                        className="max-w-[90%] max-h-[90%] object-contain shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-lg transition-all duration-500 hover:scale-[1.02]"
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setError('Unable to load image');
                            setLoading(false);
                        }}
                    />
                );
            }
        } else if (mimetype.includes('video')) {
            return (
                <div className="relative max-w-[90%] max-h-[90%] shadow-[0_8px_40px_rgba(0,0,0,0.2)] rounded-xl overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 z-10"></div>
                    <video
                        controls
                        className="w-full h-full rounded-xl"
                        onLoadStart={() => setLoading(false)}
                        onError={() => {
                            setError('Unable to load video');
                            setLoading(false);
                        }}
                    >
                        <source src={previewUrl} type={mimetype} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        } else if (mimetype.includes('pdf') ||
            mimetype.includes('document') ||
            mimetype.includes('presentation') ||
            mimetype.includes('sheet')) {
            return (
                <div className="w-[92%] h-[92%] max-w-6xl">
                    <div className="w-full h-full bg-white shadow-[0_8px_40px_rgba(0,0,0,0.2)] rounded-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 z-10"></div>
                        <iframe
                            src={previewUrl}
                            className="w-full h-full bg-white"
                            frameBorder="0"
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                setError('Unable to load document preview');
                                setLoading(false);
                            }}
                            title={`Preview of ${file.originalname}`}
                        />
                    </div>
                </div>
            );
        } else {
            // For unsupported file types, show a message
            return (
                <div className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg border border-gray-100">
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner p-5">
                            <div className="text-gray-500 transform scale-150">
                                {getFileIcon(mimetype)}
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{file.originalname}</h3>
                    <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600">Preview not available for this file type</p>
                    </div>
                </div>
            );
        }
    };

    if (!isOpen || !file) return null;

    const modalContent = (
        <div
            className="file-preview-modal-overlay backdrop-blur-sm"
            onClick={(e) => {
                // Close only if clicking directly on the overlay background
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="flex items-center justify-center w-full h-full p-8"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                {/* Modal Content Container */}
                <div
                    className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] max-w-6xl max-h-[90vh] w-full h-full flex flex-col"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}>
                    {/* Close button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 z-[9999] p-3 bg-white/90 hover:bg-white rounded-full transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                        title="Close (Esc)"
                    >
                        <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Navigation arrows */}
                    {onNavigate && allFiles && allFiles.length > 1 && (
                        <>
                            {/* Previous file arrow */}
                            {currentIndex > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onNavigate && typeof onNavigate === 'function') {
                                            onNavigate(currentIndex - 1);
                                        }
                                    }}
                                    className="absolute left-5 top-1/2 transform -translate-y-1/2 p-4 bg-black/20 hover:bg-blue-500/90 rounded-full transition-all duration-300 z-[9999] shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer backdrop-blur-sm hover:scale-110"
                                    title="Previous file (←)"
                                >
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}

                            {/* Next file arrow */}
                            {currentIndex < allFiles.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onNavigate && typeof onNavigate === 'function') {
                                            onNavigate(currentIndex + 1);
                                        }
                                    }}
                                    className="absolute right-5 top-1/2 transform -translate-y-1/2 p-4 bg-black/20 hover:bg-blue-500/90 rounded-full transition-all duration-300 z-[9999] shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer backdrop-blur-sm hover:scale-110"
                                    title="Next file (→)"
                                >
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}

                    {/* File preview content */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                        {loading && (
                            <div className="flex items-center justify-center">
                                <div className="text-center bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 border-r-transparent border-b-blue-500 mb-6 mx-auto shadow-lg"></div>
                                    <p className="text-gray-800 font-medium text-lg">Loading preview...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="bg-white/80 backdrop-blur-sm shadow-xl border-l-4 border-red-500 rounded-xl p-6 max-w-md">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-red-600 font-semibold text-lg">{error}</p>
                                        </div>
                                        <p className="text-gray-700">Unable to preview this file</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="w-full h-full flex items-center justify-center">
                                {renderPreviewContent()}
                            </div>
                        )}
                    </div>

                    {/* File info footer */}
                    <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm px-6 py-4 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            {/* File info card */}
                            <div className="flex items-center space-x-4">
                                <div className="text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl shadow-sm">
                                    {getFileIcon(file.mimetype)}
                                </div>
                                <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate" title={file.originalname}>
                                        {file.originalname}
                                    </h3>
                                    <div className="flex items-center space-x-3 mt-0.5">
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{formatFileSize(file.size)}</span>
                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{file.mimetype.split('/')[1]?.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Controls on the right side */}
                            <div className="flex items-center space-x-4">
                                {/* Cut option */}
                                {onDelete && (
                                    <div className="relative group">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (file && onDelete) {
                                                    onDelete(file._id, file.originalname);
                                                    onClose();
                                                }
                                            }}
                                            className="text-gray-700 hover:text-red-600 transition-all duration-300 cursor-pointer flex items-center z-[9999] relative p-3 rounded-full hover:bg-red-50 hover:shadow-md"
                                            aria-label="Cut file"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                            Cut file (Del)
                                        </span>
                                    </div>
                                )}

                                {allFiles && allFiles.length > 1 && (
                                    <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100">
                                        <div className="text-sm font-semibold text-gray-800 flex items-center">
                                            <span className="bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full mr-2">
                                                {currentIndex + 1}
                                            </span>
                                            <span>of {allFiles.length}</span>

                                            <div className="relative group ml-3">
                                                <svg className="w-5 h-5 text-blue-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                                    Use ← → arrow keys to navigate
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Use portal to render modal at document.body level to ensure it's above everything
    if (typeof window !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return null;
};

export default FilePreviewModal;
