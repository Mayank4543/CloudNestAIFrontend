import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Use environment variable or fallback to the hard-coded URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudnestaibackend.onrender.com';

// Define interface for API response
interface FileApiResponse {
    success: boolean;
    message?: string;
    data?: {
        _id: string;
        filename: string;
        originalname: string;
        isPublic: boolean;
        url?: string;
        mimetype?: string;
        [key: string]: unknown;
    };
}

// Define interface for error response
interface ApiError {
    response?: {
        data: unknown;
        status: number;
        headers: Record<string, string>;
    };
    request?: unknown;
    message?: string;
    [key: string]: unknown;
}

interface ShareModalProps {
    fileId: string;
    isOpen: boolean;
    onClose: () => void;
    initialIsPublic?: boolean;
    userName?: string;
    userEmail?: string;
}

// Helper function to get auth token from storage
const getAuthToken = (): string | null => {
    // Since we know the token is in sessionStorage with key 'authToken', check that first
    const authToken = sessionStorage.getItem('authToken');
    if (authToken) {

        return authToken;
    }

    // Common token key names as fallback
    const possibleKeys = [
        'token',
        'authToken',
        'accessToken',
        'jwtToken',
        'userToken',
        'auth',
        'jwt',
        'Bearer',
        'cloudnest-token',
        'cloudnest-auth'
    ];

    // Check localStorage
    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) {

            return token;
        }
    }


    for (const key of possibleKeys) {
        if (key === 'authToken') continue; // Already checked above
        const token = sessionStorage.getItem(key);
        if (token) {

            return token;
        }
    }

    console.warn('No auth token found in storage');
    return null;
};

const ShareModal: React.FC<ShareModalProps> = ({
    fileId,
    isOpen,
    onClose,
    initialIsPublic = false,
    userName = 'User',
    userEmail = 'user@example.com'
}) => {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAccessOptions, setShowAccessOptions] = useState(false);
    const accessOptionsRef = useRef<HTMLDivElement>(null);
    const [toastMessage, setToastMessage] = useState<string>('Link copied');
    const [userData, setUserData] = useState({ name: userName, email: userEmail });

    // Get user initial for avatar
    const userInitial = userData.name.charAt(0).toUpperCase();

    // Define keyframe animation for fade-in effect
    const fadeInAnimation = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
    `;

    // Reset copied state when modal opens and sync with initialIsPublic
    useEffect(() => {
        if (isOpen) {
            setIsCopied(false);
            setShowAccessOptions(false);
            setIsPublic(initialIsPublic); // Sync with prop value when opening modal
        }
    }, [isOpen, initialIsPublic]);

    // Try to get user data from localStorage if not provided through props
    useEffect(() => {
        try {
            const storedUserData = localStorage.getItem('user');
            if (storedUserData && userName === 'User') { // Only use localStorage if no name provided
                const parsedUserData = JSON.parse(storedUserData);
                if (parsedUserData && parsedUserData.name) {
                    setUserData({
                        name: parsedUserData.name || userName,
                        email: parsedUserData.email || userEmail
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to get user data from local storage:', error);
        }
    }, [userName, userEmail]);

    // Close access options dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accessOptionsRef.current && !accessOptionsRef.current.contains(event.target as Node)) {
                setShowAccessOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Set public access
    const setPublicAccess = async (makePublic: boolean) => {
        try {
            setIsLoading(true);

            // First update the local state for immediate UI feedback
            setIsPublic(makePublic);

            // Get token using our helper function
            const token = getAuthToken();



            if (!token) {
                console.error('Authentication token not found in localStorage');

                // Continue without token as a fallback
                console.warn('Attempting to update file access without token');

                // Don't revert UI state yet, let's try the API call anyway
                // The API might still work with cookies or other auth methods
            }


            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Add token if available
            if (token) {
                // Since we know it's from authToken in sessionStorage, 
                // it's likely already formatted correctly
                if (token.startsWith('Bearer ')) {
                    headers['Authorization'] = token;
                } else {
                    headers['Authorization'] = `Bearer ${token}`;
                }

            }

            // Always use the same endpoint but with different isPublic value
            const endpoint = `${API_BASE_URL}/api/files/${fileId}/public`;
            const requestData = { isPublic: makePublic };

            console.log(`Setting file access to ${makePublic ? 'public' : 'private'} using endpoint: ${endpoint}`);

            const response = await axios.put(
                endpoint,
                requestData,
                {
                    headers,
                    withCredentials: true // Include cookies in the request
                }
            );



            // Log the full response to help debug
            console.log('Full API Response:', response.data);
            console.log('Request details:', {
                endpoint,
                requestData,
                makePublic,
                headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : 'None' }
            });

            // Safely handle the response with proper type checking
            const responseData = response.data as FileApiResponse;

            // Check if response is successful
            if (responseData && responseData.success === true) {
                // API response follows pattern { success, message, data: { ...fileData } }
                const fileData = responseData.data;

                if (fileData && typeof fileData === 'object') {
                    // Check if the file's public status matches what we requested
                    if (fileData.isPublic === makePublic) {
                        console.log('File public status successfully updated to:', makePublic);
                    } else {
                        console.warn('File public status in response does not match requested state:',
                            fileData.isPublic !== undefined ? fileData.isPublic : 'undefined',
                            'requested:', makePublic);

                        // Even if the status doesn't match in the response, trust our UI state
                        // This is useful if the API has a discrepancy but our action was successful
                        console.log('Trusting UI state despite response discrepancy');
                    }
                } else {
                    console.log('File updated successfully but data structure is different than expected');
                }
            } else {
                // API call succeeded but returned an error
                console.error('API response indicates failure:', responseData);
                setIsPublic(!makePublic); // Revert on error response
            }

            setShowAccessOptions(false);
        } catch (error) {
            console.error('Error updating file access:', error);
            const err = error as ApiError;

            // More detailed error logging
            if (err.response) {
                // The request was made and the server responded with a non-2xx status
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                console.error('Response headers:', err.response.headers);

                if (err.response.status === 401) {
                    console.warn('Authentication issue. Please check your login status.');

                    // Try to get the token again in case it changed
                    const freshToken = getAuthToken();
                    console.log('Fresh token check:', freshToken ? 'Token found' : 'No token found');
                }
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
            } else {
                // Something happened in setting up the request
                console.error('Request setup error:', err.message);
            }

            // Revert on error
            setIsPublic(!makePublic);

            // Show appropriate error message based on error type
            if (err.response && err.response.status === 401) {
                alert('Authentication error. Please try logging out and logging in again.');
            } else if (err.response) {
                alert(`Error: ${(err.response.data as { message?: string })?.message || 'Failed to update access settings. Please try again.'}`);
            } else {
                alert('Failed to update access settings. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Copy link to clipboard based on file type
    const copyLink = async () => {
        try {
            const token = getAuthToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            if (token) {
                if (token.startsWith('Bearer ')) {
                    headers['Authorization'] = token;
                } else {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            // First get the file details to check if it's public and get its details
            const response = await axios.get(
                `${API_BASE_URL}/api/files/${fileId}`,
                {
                    headers,
                    withCredentials: true
                }
            );

            // Extract the file data from the response
            const responseData = response.data as FileApiResponse;

            if (!responseData || (!responseData.data && !(responseData as { filename?: string }).filename)) {
                throw new Error('Invalid file data received');
            }

            // Extract file data, handling both response formats
            const fileData = responseData.data || responseData as unknown as {
                filename?: string;
                originalname?: string;
                mimetype?: string;
                isPublic?: boolean;
            };

            // Get file details
            const filename = fileData.filename || fileData.originalname || 'unknown_file';
            const mimetype = fileData.mimetype || '';
            const isFilePublic = fileData.isPublic === true;

            // Use different approaches for public vs private files
            let link = '';

            // IMPORTANT: To avoid CORS issues, we'll use the backend's proxy endpoints
            // instead of directly accessing R2 storage URLs

            if (isFilePublic) {
                // For public files, use a backend proxy URL that will handle the file retrieval
                // This will avoid CORS issues with direct R2 access
                link = `${API_BASE_URL}/api/files/view/${fileId}`;
            } else {
                // For private files, use an authenticated view endpoint
                // This ensures proper auth checks and avoids CORS issues
                const frontendHost = window.location.origin;
                link = `${frontendHost}/api/proxy/files/${fileId}`;

                // Alternatively, use a backend endpoint that requires authentication
                // link = `${API_BASE_URL}/api/files/secure-view/${fileId}`;
            }

            // Special handling for PowerPoint files
            if (mimetype.includes('presentation') ||
                mimetype.includes('powerpoint') ||
                filename.endsWith('.ppt') ||
                filename.endsWith('.pptx')) {
                if (isFilePublic) {
                    // Create a proxy-based URL for Office Online
                    const proxyUrl = `${API_BASE_URL}/api/files/view/${fileId}`;
                    link = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyUrl)}`;
                    setToastMessage('PowerPoint viewer link copied');
                } else {
                    // For private files, we can't use Office Online viewer (needs public URL)
                    setToastMessage('PowerPoint link copied (requires login)');
                }
            }
            // For PDF files
            else if (mimetype.includes('pdf') || filename.endsWith('.pdf')) {
                setToastMessage(isFilePublic ? 'PDF link copied' : 'PDF link copied (expires in 1 hour)');
            }
            // For images
            else if (mimetype.includes('image')) {
                setToastMessage(isFilePublic ? 'Image link copied' : 'Image link copied (expires in 1 hour)');
            }
            // For other formats
            else {
                setToastMessage(isFilePublic ? 'File link copied' : 'File link copied (expires in 1 hour)');
            }

            // Copy link to clipboard
            navigator.clipboard.writeText(link);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000); // Reset after 3 seconds
        } catch (error) {
            console.error('Error getting file access link:', error);
            // Fallback to frontend preview link if API call fails
            const frontendHost = window.location.origin;
            // Use the correct preview path - make sure this matches your frontend routes
            const fallbackLink = `${frontendHost}/files/preview/${fileId}`;
            navigator.clipboard.writeText(fallbackLink);
            setToastMessage('App preview link copied (login required)');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-white/70 z-[300] flex items-center justify-center" onClick={onClose}>
            <style dangerouslySetInnerHTML={{ __html: fadeInAnimation }} />
            <div
                className="bg-white rounded-lg shadow-xl w-[500px] max-w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Share</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* People with access */}
                <div className="px-6 py-4">
                    <h3 className="text-base font-medium text-gray-800 mb-4">People with access</h3>
                    <div className="flex items-center mb-6">
                        <div className="h-10 w-10 bg-[#18b26f] rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {userInitial}
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{userData.name} (you)</p>
                            <p className="text-xs text-gray-500">{userData.email}</p>
                        </div>
                        <span className="ml-auto text-sm text-gray-500">Owner</span>
                    </div>

                    {/* General access */}
                    <div className="mt-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">General access</h3>
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                {isPublic ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-4">
                                <div className="relative inline-block" ref={accessOptionsRef}>
                                    <button
                                        className="flex items-center text-sm font-medium text-gray-900 hover:bg-gray-100 rounded px-2 py-1 transition-all duration-200"
                                        onClick={() => setShowAccessOptions(!showAccessOptions)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-blue-500 rounded-full"></span>
                                                Updating...
                                            </div>
                                        ) : (
                                            <>
                                                {isPublic ? (
                                                    <span className="text-blue-600 font-medium">Anyone with the link</span>
                                                ) : (
                                                    <span>Restricted</span>
                                                )}
                                                <svg className="ml-1 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    {/* Access options dropdown */}
                                    {showAccessOptions && (
                                        <div className="absolute left-0 mt-2 w-60 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                            <div className="py-1">
                                                <button
                                                    className={`flex items-center w-full px-4 py-3 text-sm ${!isPublic ? 'bg-gray-100' : ''}`}
                                                    onClick={() => setPublicAccess(false)}
                                                >
                                                    <div className="mr-3 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium text-black">Restricted</div>
                                                        <div className="text-xs text-blue-500">Private link expires in 1 hour</div>
                                                    </div>
                                                    {!isPublic && (
                                                        <svg className="ml-auto w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>

                                                <button
                                                    className={`flex items-center w-full px-4 py-3 text-sm ${isPublic ? 'bg-gray-100' : ''}`}
                                                    onClick={() => setPublicAccess(true)}
                                                >
                                                    <div className="mr-3 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium text-black ">Anyone with the link</div>
                                                        <div className="text-xs text-blue-500">Public link never expires</div>
                                                    </div>
                                                    {isPublic && (
                                                        <svg className="ml-auto w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isPublic
                                        ? 'Anyone on the internet with the link can view'
                                        : 'Link will expire in 1 hour for security'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer with copy link and done buttons */}
                <div className="px-6 py-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
                    <div className="relative">
                        <button
                            onClick={copyLink}
                            className={`inline-flex items-center px-4 py-2 border ${isPublic ? 'border-blue-300' : 'border-gray-300'} rounded-md shadow-sm text-sm font-medium ${isPublic ? 'text-blue-700' : 'text-gray-500'} ${isPublic ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            <svg className={`w-4 h-4 mr-2 ${isPublic ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {isPublic ? 'Copy public link' : 'Copy private link (1hr)'}
                        </button>

                        {/* Toast notification for link copied */}
                        {isCopied && (
                            <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-6 py-3 rounded-md shadow-xl z-50 flex items-center animate-fade-in">
                                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {toastMessage}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#18b26f] hover:bg-[#149e60] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
