import React, { useState, ChangeEvent, FormEvent } from 'react';
import { api } from '@/utils/api';
import { isAxiosError } from 'axios';
import Toast from '@/component/common/Toast';


const UploadForm: React.FC = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [tags, setTags] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [responseMessage, setResponseMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Toast states
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    // Helper function to show toast
    const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
            // Reset success message if new files are selected
            setUploadSuccess(false);
        }
    };

    // Handle tag input
    const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTags(e.target.value);
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

            // Append tags if they exist
            if (tags.trim()) {
                const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                formData.append('tags', JSON.stringify(tagArray));
            }

            // Make API request with Authorization header
            const response = await api.files.upload(formData);

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
                // setResponseMessage(successMsg);
                showToastMessage(successMsg, 'success');
                console.log('Upload response:', responseData);

                // Reset form
                setFiles(null);
                setTags('');
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
            <div className="font-['Inter',system-ui,sans-serif] max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6 my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Upload Files</h2>
                    <a
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#18b26f] transition-all duration-150"
                    >
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        Back to Dashboard
                    </a>
                </div>

                {uploadSuccess && responseMessage && (
                    <div className="bg-[#e6f5ee] border border-[#18b26f] text-[#18b26f] px-4 py-3 rounded mb-6">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {responseMessage}
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errorMessage}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Files
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col w-full h-40 border-2 border-dashed border-[#18b26f]/30 bg-gray-50 rounded-lg cursor-pointer hover:bg-[#f7fcfa] hover:border-[#18b26f]/50 transition-all duration-200 focus-within:outline-none">
                                <div className="flex flex-col items-center justify-center pt-6 pb-6">
                                    <svg className="w-12 h-12 text-[#18b26f] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-base text-gray-600">
                                        <span className="font-semibold text-[#18b26f]">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        You can select multiple files
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

                    {/* File Preview */}
                    {files && files.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                                    {Array.from(files).map((file, index) => (
                                        <li key={index} className="px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-[#e6f5ee] text-[#18b26f] rounded">
                                                    {file.type.includes('image') ? (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : file.type.includes('pdf') ? (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Tags Input */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma separated, optional)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="tags"
                                value={tags}
                                onChange={handleTagChange}
                                placeholder="tag1, tag2, tag3"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#18b26f] focus:border-[#18b26f] sm:text-sm transition-all duration-150"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Tags help you organize and find files more easily</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isUploading || !files}
                            className={`
                            px-4 py-2 rounded-md text-sm font-medium text-white 
                            ${isUploading || !files
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150'
                                }
                        `}
                        >
                            {isUploading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload Files
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UploadForm;
