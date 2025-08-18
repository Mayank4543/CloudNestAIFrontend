import React, { useState } from 'react';
import { formatFileSize, getFileType, getLocationPath } from '@/utils/api';
import FileItemMenu from './FileItemMenu';

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
    starred?: boolean;
    owner?: {
        name: string;
        email: string;
    };
}

interface FileItemProps {
    file: FileData;
    onDownload: (fileId: string, fileName: string) => void;
    onDelete: (fileId: string, fileName: string) => void;
    onRename?: (fileId: string, newName: string) => void;
    onCopy?: (fileId: string) => void;
    onShare?: (fileId: string) => void;
    onPreview?: (file: FileData) => void;
    onMove?: (fileId: string) => void;
    onToggleStar?: (fileId: string) => void;
    viewMode?: 'list' | 'grid';
}

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
    } else if (mimetype.includes('audio')) {
        return (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
            </svg>
        );
    } else if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive')) {
        return (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
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

const getPrivacyBadge = (isPublic: boolean) => {
    if (isPublic) {
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 3.314-2.686 6-6 6s-6-2.686-6-6a5.99 5.99 0 01.332-2.027z" clipRule="evenodd" />
                </svg>
                Public
            </span>
        );
    } else {
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Private
            </span>
        );
    }
};

const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

const formatDateFull = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const FileItem: React.FC<FileItemProps> = ({
    file,
    onDownload,
    onDelete,
    onRename,
    onCopy,
    onShare,
    onPreview,
    onMove,
    onToggleStar,
    viewMode = 'list'
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    const handleDoubleClick = () => {
        onPreview?.(file);
    };

    if (viewMode === 'grid') {
        return (
            <div
                className={`
                    relative bg-white border border-gray-200 rounded-lg p-4 cursor-pointer
                    transition-all duration-200 hover:shadow-md hover:border-gray-300
                    ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDoubleClick={handleDoubleClick}
                onClick={() => setIsSelected(!isSelected)}
            >
                {/* Menu button positioned absolutely */}
                <div className="absolute top-2 right-2 z-10">
                    <FileItemMenu
                        file={file}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onRename={onRename}
                        onCopy={onCopy}
                        onShare={onShare}
                        onPreview={onPreview}
                        onMove={onMove}
                        onToggleStar={onToggleStar}
                        isParentHovered={isHovered}
                    />
                </div>

                {/* Star Icon Indicator */}
                {file.starred && (
                    <div className="absolute top-2 left-2 z-10">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    </div>
                )}

                <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-[#e6f5ee] text-[#18b26f] rounded-lg flex items-center justify-center mb-3">
                        {getFileIcon(file.mimetype)}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 text-center truncate w-full pr-8" title={file.originalname}>
                        {file.originalname}
                    </h3>
                    <div className="mt-2 flex justify-center">
                        {getPrivacyBadge(file.isPublic)}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                        <div className="h-6 w-6 bg-[#18b26f] rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {file.owner?.name ? file.owner.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <span className="text-xs text-gray-500">
                            {file.owner?.name || 'Me'}
                        </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 text-center">
                        <span title={formatDateFull(file.updatedAt)}>
                            {formatFileSize(file.size)} • {formatDateShort(file.updatedAt)}
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 text-center">
                        {getLocationPath(file.path)}
                    </div>
                    {file.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 justify-center">
                            {file.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6f5ee] text-[#18b26f]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // List view
    return (
        <tr
            className={`
                hover:bg-gray-50 transition-colors cursor-pointer
                ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleDoubleClick}
            onClick={() => setIsSelected(!isSelected)}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-[#e6f5ee] text-[#18b26f] rounded-lg flex items-center justify-center">
                        {getFileIcon(file.mimetype)}
                    </div>
                    <div className="ml-4 flex-grow">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate flex items-center">
                            {file.originalname}
                            {file.starred && (
                                <svg className="ml-2 w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                                {getFileType(file.mimetype)}
                            </span>
                            {getPrivacyBadge(file.isPublic)}
                        </div>
                        {file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6f5ee] text-[#18b26f]">
                                        {tag}
                                    </span>
                                ))}
                                {file.tags.length > 3 && (
                                    <span className="text-xs text-gray-400">+{file.tags.length - 3}</span>
                                )}
                            </div>
                        )}
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
                        <div className="text-xs text-gray-500">
                            {file.owner?.email || 'Owner'}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{getLocationPath(file.path)}</div>
                <div className="text-xs text-gray-500">{file.isPublic ? 'Accessible to anyone' : 'Only you'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span title={formatDateFull(file.updatedAt)}>
                    {formatDateShort(file.updatedAt)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatFileSize(file.size)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center justify-end">
                    <FileItemMenu
                        file={file}
                        onDownload={onDownload}
                        onDelete={onDelete}
                        onRename={onRename}
                        onCopy={onCopy}
                        onShare={onShare}
                        onPreview={onPreview}
                        onMove={onMove}
                        onToggleStar={onToggleStar}
                        isParentHovered={isHovered}
                    />
                </div>
            </td>
        </tr>
    );
};

export default FileItem;
