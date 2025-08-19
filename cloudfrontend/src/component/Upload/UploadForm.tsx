import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { api } from '@/utils/api';
import { isAxiosError } from 'axios';
import Toast from '@/component/common/Toast';
import AITagSuggestions from './AITagSuggestions';
import PartitionSelector from '@/component/Dashboard/Partitions/PartitionSelector';

// File size constants
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes


const UploadForm: React.FC = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [tags, setTags] = useState<string>('');
    const [aiSelectedTags, setAiSelectedTags] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [responseMessage, setResponseMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // New states for additional features
    const [enableAITagging, setEnableAITagging] = useState<boolean>(true);
    const [cutMode, setCutMode] = useState<boolean>(false);
    const [selectedPartition, setSelectedPartition] = useState<string>('personal');

    // Toast states
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    // Check auth status on mount
    useEffect(() => {
        // Check all storage items to see what's there
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                localStorage.getItem(key);
            }
        }
    }, []);

    // Helper function to show toast
    const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };


    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);

            // Validate file sizes
            const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);

            if (oversizedFiles.length > 0) {
                const oversizedFileNames = oversizedFiles.map(file => `${file.name} (${formatFileSize(file.size)})`).join(', ');
                showToastMessage(
                    `The following files exceed the 2GB limit: ${oversizedFileNames}`,
                    'error'
                );
                // Clear the input
                e.target.value = '';
                return;
            }

            setFiles(e.target.files);
            // Reset success message and AI tags if new files are selected
            setUploadSuccess(false);
            setAiSelectedTags([]);
        }
    };

    // Handle cut/copy functionality
    const handleCutCopy = async () => {
        if (!files || files.length === 0) {
            showToastMessage('Please select files first', 'warning');
            return;
        }

        try {
            const fileItems = Array.from(files).map(file => {
                return new ClipboardItem({
                    [file.type]: file
                });
            });

            if ('clipboard' in navigator && 'write' in navigator.clipboard) {
                await navigator.clipboard.write(fileItems);
                showToastMessage(
                    cutMode ? 'Files cut to clipboard' : 'Files copied to clipboard',
                    'success'
                );
            } else {
                // Fallback for browsers that don't support the Clipboard API
                showToastMessage('Clipboard operation not supported in this browser', 'warning');
            }
        } catch (error) {
            console.error('Clipboard operation failed:', error);
            showToastMessage('Failed to copy files to clipboard', 'error');
        }
    };

    // Remove selected files (for cut mode)
    const handleRemoveFiles = () => {
        setFiles(null);
        setAiSelectedTags([]);
        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        showToastMessage('Files removed', 'info');
    };

    // Handle tag input with chips functionality
    const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Handle comma-separated tag entry
        if (value.includes(',')) {
            const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            const existingTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            const allTags = [...new Set([...existingTags, ...newTags])];
            setTags(allTags.join(', '));
        } else {
            setTags(value);
        }
    };

    // Convert manual tags to array
    const getManualTags = (): string[] => {
        return tags.trim()
            ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            : [];
    };

    // Remove a manual tag
    const removeManualTag = (tagToRemove: string) => {
        const currentTags = getManualTags();
        const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags.join(', '));
    };

    // Remove an AI tag
    const removeAITag = (tagToRemove: string) => {
        const updatedAITags = aiSelectedTags.filter(tag => tag !== tagToRemove);
        setAiSelectedTags(updatedAITags);
    };

    // Get file type info with color coding
    const getFileTypeInfo = (file: File) => {
        const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const type = file.type.toLowerCase();

        let color = 'bg-gray-100 text-gray-800';
        if (type.includes('pdf')) color = 'bg-red-100 text-red-800';
        else if (type.includes('word') || extension.includes('DOC')) color = 'bg-blue-100 text-blue-800';
        else if (type.includes('sheet') || extension.includes('XLS')) color = 'bg-green-100 text-green-800';
        else if (type.includes('image')) color = 'bg-purple-100 text-purple-800';
        else if (type.includes('text')) color = 'bg-yellow-100 text-yellow-800';

        return { extension, color };
    };

    // Handle AI tag selection
    const handleAITagsSelected = (tags: string[]) => {
        setAiSelectedTags(tags);
    };

    // Get all tags (user + AI)
    const getAllTags = (): string[] => {
        const userTags = tags.trim()
            ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            : [];

        // Combine user tags with AI tags, removing duplicates
        const allTags = [...userTags, ...aiSelectedTags];
        return [...new Set(allTags)];
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!files || files.length === 0) {
            setErrorMessage('Please select at least one file');
            return;
        }

        // Get authentication token
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (!authToken) {
            const authError = 'Authentication required. Please log in first.';
            setErrorMessage(authError);
            showToastMessage(authError, 'warning');
            return;
        }

        setIsUploading(true);
        setErrorMessage('');
        setResponseMessage('');

        try {
            const formData = new FormData();


            if (files[0]) {
                formData.append('file', files[0]);
            }

            // Append all tags (user + AI) if they exist
            const allTags = getAllTags();
            if (allTags.length > 0) {
                formData.append('tags', JSON.stringify(allTags));
            }

            // Make API request with Authorization header and partition
            const response = await api.files.upload(formData, selectedPartition);

            // Type guard for response data
            interface UploadResponse {
                success: boolean;
                message?: string;
                data?: {
                    file?: {
                        _id: string;
                        filename: string;
                        originalname: string;
                        mimetype: string;
                        size: number;
                        path: string;
                        userId: string;
                    }
                };
            }

            // Handle successful response
            const responseData = response.data as UploadResponse;

            if (responseData.success) {
                setUploadSuccess(true);
                const successMsg = responseData.message || 'File uploaded successfully!';
                showToastMessage(successMsg, 'success');


                // Notify dashboard to refresh (for cross-tab communication)
                localStorage.setItem('fileUploaded', Date.now().toString());

                // Trigger custom event for same-tab communication
                window.dispatchEvent(new CustomEvent('fileUploaded', {
                    detail: {
                        file: responseData.data?.file,
                        tags: getAllTags()
                    }
                }));

                // Reset form
                setFiles(null);
                setTags('');
                setAiSelectedTags([]);
                setSelectedPartition('personal');
                // Reset the file input by targeting the form element
                const form = e.target as HTMLFormElement;
                form.reset();
            } else {
                throw new Error(responseData.message || 'Upload failed');
            }
        } catch (error: unknown) {
            setUploadSuccess(false);
            console.error('Upload failed:', error);

            if (isAxiosError(error)) {
                const errorResponse = error.response?.data as { message?: string } | undefined;
                const errorMsg = errorResponse?.message || 'Network error occurred. Please try again.';

                // Handle authentication errors specifically
                if (error.response?.status === 401) {
                    const authErrorMsg = 'Authentication failed. Please log in again.';
                    setErrorMessage(authErrorMsg);
                    showToastMessage(authErrorMsg, 'error');
                } else {
                    setErrorMessage(errorMsg);
                    showToastMessage(errorMsg, 'error');
                }
            } else if (error instanceof Error) {
                setErrorMessage(error.message);
                showToastMessage(error.message, 'error');
            } else {
                const genericError = 'Upload failed. Please try again.';
                setErrorMessage(genericError);
                showToastMessage(genericError, 'error');
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    return (
        <>
            <Toast
                message={toastMessage}
                type={toastType}
                show={showToast}
                onHide={() => setShowToast(false)}
            />
            <div className="font-['Inter',system-ui,sans-serif] max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#18b26f] to-[#149d5f] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            Upload Files
                        </h2>
                        <a
                            href="/dashboard"
                            className="inline-flex items-center text-sm text-white/80 hover:text-white transition-all duration-150 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg"
                        >
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                            Back to Dashboard
                        </a>
                    </div>
                </div>

                {/* Alert Messages */}
                <div className="px-6 pt-6">
                    {uploadSuccess && responseMessage && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 shadow-sm">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {responseMessage}
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 shadow-sm">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errorMessage}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content - Two Column Layout */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column - File Upload Area */}
                        <div className="space-y-6">



                            {/* Enhanced File Input with Gradient Background */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Files
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col w-full h-48 border-2 border-dashed border-[#18b26f]/40 bg-gradient-to-br from-gray-50 via-white to-[#f7fcfa] rounded-xl cursor-pointer hover:from-[#f7fcfa] hover:to-[#e6f5ee] hover:border-[#18b26f]/60 transition-all duration-300 shadow-sm hover:shadow-md group">
                                        <div className="flex flex-col items-center justify-center pt-8 pb-8">
                                            <svg className="w-16 h-16 text-[#18b26f] mb-4 transform group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-lg text-gray-700 font-medium">
                                                <span className="font-bold text-[#18b26f] group-hover:text-[#149d5f]">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Support for multiple files • Max 2GB per file
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Enhanced File Preview with Type Indicators */}
                            {files && files.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Selected Files ({files.length})
                                        </h3>

                                        {/* Enhanced Cut/Copy Controls */}
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1">
                                                <input
                                                    type="checkbox"
                                                    id="cutMode"
                                                    checked={cutMode}
                                                    onChange={(e) => setCutMode(e.target.checked)}
                                                    className="h-4 w-4 text-[#18b26f] focus:ring-[#18b26f] border-gray-300 rounded"
                                                />
                                                <label htmlFor="cutMode" className="ml-2 text-sm text-gray-700 font-medium">
                                                    Cut mode
                                                </label>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleCutCopy}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-colors"
                                            >
                                                {cutMode ? (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-7-4h1m4 0h1M7 16h10M7 8h10"></path>
                                                        </svg>
                                                        Cut
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                        </svg>
                                                        Copy
                                                    </>
                                                )}
                                            </button>

                                            {cutMode && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFiles}
                                                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                        <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                            {Array.from(files).map((file, index) => {
                                                const { extension, color } = getFileTypeInfo(file);
                                                return (
                                                    <li key={index} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-gradient-to-br from-[#e6f5ee] to-[#f7fcfa] text-[#18b26f] rounded-xl shadow-sm">
                                                                    {file.type.includes('image') ? (
                                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : file.type.includes('pdf') ? (
                                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                                                                    {extension}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Partition, Tags and AI Suggestions */}
                        <div className="space-y-6">
                            {/* Partition Selection */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                                <PartitionSelector
                                    selectedPartition={selectedPartition}
                                    onPartitionChange={setSelectedPartition}
                                    disabled={isUploading}
                                    showUsage={true}
                                />
                            </div>
                            {/* Enhanced Tags Input with Chips */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                <label htmlFor="tags" className="text-lg font-semibold text-black mb-4 flex items-center">
                                    <svg className="h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    Custom Tags
                                </label>

                                {/* Manual Tags Display */}
                                {getManualTags().length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {getManualTags().map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white shadow-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeManualTag(tag)}
                                                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-500 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type="text"
                                        id="tags"
                                        value={tags}
                                        onChange={handleTagChange}
                                        placeholder="Add tags or use AI suggestions below..."
                                        className="block w-full pl-10 pr-3 py-3 border text-black border-blue-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all duration-150"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-blue-600">Separate multiple tags with commas</p>
                            </div>

                            {/* Enhanced AI Tagging Toggle */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="enableAITagging"
                                                checked={enableAITagging}
                                                onChange={(e) => setEnableAITagging(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor="enableAITagging"
                                                className={`flex items-center h-6 w-12 rounded-full cursor-pointer transition-colors ${enableAITagging ? 'bg-[#18b26f]' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${enableAITagging ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                />
                                            </label>
                                        </div>
                                        <span className="ml-3 text-lg font-semibold text-gray-800">
                                            AI Tag Suggestions
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                        </svg>
                                        AI Powered
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">
                                    {enableAITagging
                                        ? "AI will automatically analyze your files and suggest relevant tags"
                                        : "AI tagging is disabled. You can still add tags manually above."
                                    }
                                </p>

                                {/* AI Tag Suggestions */}
                                {files && files.length > 0 && enableAITagging && (
                                    <AITagSuggestions
                                        file={files[0]}
                                        onTagsSelected={handleAITagsSelected}
                                        disabled={isUploading}
                                        autoGenerate={enableAITagging}
                                    />
                                )}
                            </div>

                            {/* Combined Tags Display */}
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Final Tags ({getAllTags().length})
                                </h4>
                                <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 bg-white rounded-lg border border-gray-200">
                                    {getAllTags().length > 0 ? (
                                        getAllTags().map((tag, index) => {
                                            const isAITag = aiSelectedTags.includes(tag);
                                            return (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${isAITag
                                                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                                                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                                        }`}
                                                >
                                                    {isAITag && (
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => isAITag ? removeAITag(tag) : removeManualTag(tag)}
                                                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-gray-500 text-sm italic flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            No tags selected
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Upload Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isUploading || !files}
                                    className={`
                                        w-full px-6 py-4 rounded-xl text-base font-semibold text-white shadow-lg
                                        transform transition-all duration-200 
                                        ${isUploading || !files
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#18b26f] to-[#149d5f] hover:from-[#149d5f] hover:to-[#128a52] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                                        }
                                    `}
                                >
                                    {isUploading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading {files ? files.length : 0} file{files && files.length > 1 ? 's' : ''}...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Upload {files ? files.length : 0} File{files && files.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UploadForm;
