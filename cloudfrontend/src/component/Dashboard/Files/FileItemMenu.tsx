import React, { useState, useEffect, useRef } from 'react';

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

interface FileItemMenuProps {
    file: FileData;
    onDownload: (fileId: string, fileName: string) => void;
    onDelete: (fileId: string, fileName: string) => void;
    onRename?: (fileId: string, newName: string) => void;
    onCopy?: (fileId: string) => void;
    onPreview?: (file: FileData) => void;
    onShare?: (fileId: string) => void;
    onMove?: (fileId: string, destinationFolderId: string) => void;
    isParentHovered?: boolean;
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    hasSubmenu?: boolean;
    submenu?: React.ReactNode;
    divider?: boolean;
    disabled?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    label,
    shortcut,
    onClick,
    hasSubmenu,
    submenu,
    divider,
    disabled = false,
}) => {
    const [showSubmenu, setShowSubmenu] = useState(false);

    return (
        <>
            <div
                className={`
                    relative flex items-center px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 ease-out
                    ${disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${hasSubmenu ? 'pr-8' : ''}
                `}
                onClick={disabled ? undefined : onClick}
                onMouseEnter={() => hasSubmenu && setShowSubmenu(true)}
                onMouseLeave={() => hasSubmenu && setShowSubmenu(false)}
            >
                <span className="flex items-center justify-center w-4 h-4 mr-3 flex-shrink-0">
                    {icon}
                </span>
                <span className="flex-1 font-medium">{label}</span>
                {shortcut && (
                    <span className="ml-auto text-xs text-gray-400 font-normal">{shortcut}</span>
                )}
                {hasSubmenu && (
                    <svg
                        className={`w-4 h-4 absolute right-3 text-gray-400 transition-transform duration-150 ${showSubmenu ? 'scale-110' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                )}

                {/* Submenu */}
                {hasSubmenu && showSubmenu && submenu && (
                    <div
                        className="absolute left-full top-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-in slide-in-from-left-2 duration-200"
                        style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 10000
                        }}
                    >
                        {submenu}
                    </div>
                )}
            </div>
            {divider && <div className="border-t border-gray-100 my-1" />}
        </>
    );
};

const FileItemMenu: React.FC<FileItemMenuProps> = ({
    file,
    onDownload,
    onDelete,
    onRename,
    onCopy,
    onPreview,
    onShare,
    onMove,
    isParentHovered
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key === 'p') {
                e.preventDefault();
                onPreview?.(file);
            }
        };

        // Add event listener for keyboard shortcuts
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [file, onPreview]);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate menu position based on available space
    useEffect(() => {
        if (isMenuOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const menuHeight = 250; // Actual menu height

            // Check if there's enough space below (with some padding)
            const spaceBelow = windowHeight - buttonRect.bottom - 20;

            if (spaceBelow < menuHeight) {
                setMenuPosition('top');
            } else {
                setMenuPosition('bottom');
            }
        }
    }, [isMenuOpen]);

    const handlePreview = () => {
        onPreview?.(file);
        setIsMenuOpen(false);
    };

    const handleOpenInNewTab = () => {
        if (file.url) {
            window.open(file.url, '_blank');
        }
        setIsMenuOpen(false);
    };

    const handleDownload = () => {
        onDownload(file._id, file.originalname);
        setIsMenuOpen(false);
    };

    const handleRename = () => {
        const newName = prompt('Enter new name:', file.originalname);
        if (newName && newName !== file.originalname) {
            onRename?.(file._id, newName);
        }
        setIsMenuOpen(false);
    };

    const handleCopy = () => {
        onCopy?.(file._id);
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        onDelete(file._id, file.originalname);
        setIsMenuOpen(false);
    };

    const handleGetLink = () => {
        if (file.url) {
            navigator.clipboard.writeText(file.url);
            // You might want to show a toast here
        }
        setIsMenuOpen(false);
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent(`Shared file: ${file.originalname}`);
        const body = encodeURIComponent(`I'm sharing this file with you: ${file.url || 'File link not available'}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
        setIsMenuOpen(false);
    };

    const handleShareFile = () => {
        if (onShare) {
            onShare(file._id);
            setIsMenuOpen(false);
        }
    };

    const handleMoveFile = () => {
        if (onMove) {
            // For simplicity, we'll just call onMove - in a real app you'd show a folder picker UI
            onMove(file._id, ''); // Second param would typically be destination folder ID
            setIsMenuOpen(false);
        }
    };

    // Removed unused handleFileInfo function
    // Removed unused formatFileSize function

    // Open With Submenu
    const openWithSubmenu = (
        <div className="py-1">
            <MenuItem
                icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="#4285f4" />
                    </svg>
                }
                label="Google Docs"
                onClick={() => {
                    window.open(`https://docs.google.com/document/create`, '_blank');
                    setIsMenuOpen(false);
                }}
            />
            <MenuItem
                icon={
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v1h8V6H6zm0 3v1h8V9H6zm0 3v1h5v-1H6z" clipRule="evenodd" />
                    </svg>
                }
                label="Text Editor"
                onClick={() => {
                    // Could open in a text editor view
                    handlePreview();
                }}
            />
            <MenuItem
                icon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="#dc2626" />
                    </svg>
                }
                label="DocHub"
                onClick={() => {
                    window.open(`https://dochub.com`, '_blank');
                    setIsMenuOpen(false);
                }}
            />
        </div>
    );

    // Share Submenu
    const shareSubmenu = (
        <div className="py-1">
            <MenuItem
                icon={
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                }
                label="Get Link"
                onClick={handleGetLink}
            />
            <MenuItem
                icon={
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                }
                label="Email"
                onClick={handleEmailShare}
            />
            <MenuItem
                icon={
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                }
                label="Share with others"
                onClick={handleShareFile}
            />
        </div>
    );

    return (
        <div
            className="relative inline-block"
        >
            {/* Three-dot menu button - show on hover or when parent is hovered */}
            <button
                ref={buttonRef}
                className={`p-2 rounded-full hover:bg-gray-100 transition-all duration-200 ease-out ${isParentHovered ? 'opacity-100 visible' : 'opacity-100 visible'}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                }}
                title="More actions"
            >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    className={`
                        absolute right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1
                        transition-all duration-200 ease-out
                        ${menuPosition === 'top'
                            ? 'bottom-full mb-1'
                            : 'top-full mt-1'
                        }
                    `}
                    style={{
                        maxHeight: '240px',
                        overflowY: 'hidden',
                        zIndex: 9999,
                    }}
                >
                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        }
                        label="Preview"
                        onClick={handlePreview}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        }
                        label="Open in new tab"
                        onClick={handleOpenInNewTab}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        }
                        label="Open with"
                        hasSubmenu={true}
                        submenu={openWithSubmenu}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        }
                        label="Download"
                        onClick={handleDownload}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        }
                        label="Rename"
                        onClick={handleRename}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                        }
                        label="Make a copy"
                        onClick={handleCopy}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        }
                        label="Move to folder"
                        onClick={handleMoveFile}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        }
                        label="Share"
                        hasSubmenu={true}
                        submenu={shareSubmenu}
                    />

                    <MenuItem
                        icon={
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                        label="Move to trash"
                        onClick={handleDelete}
                    />
                </div>
            )}
        </div>
    );
};

export default FileItemMenu;
