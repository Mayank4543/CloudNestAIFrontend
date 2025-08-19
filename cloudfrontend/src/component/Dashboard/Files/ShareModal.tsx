import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ScanWithAI from './ScanWithAI';
import SensitiveDataAlert from './SensitiveDataAlert';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ScanResult {
    containsSensitiveData: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    sensitiveDataTypes: string[];
    details: string[];
    recommendation: string;
}

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

interface ApiError {
    response?: { data: unknown; status: number; headers: Record<string, string> };
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

const getAuthToken = (): string | null => {
    const authToken = sessionStorage.getItem('authToken');

    if (authToken) return authToken;

    const possibleKeys = [
        'token', 'accessToken', 'jwtToken', 'userToken', 'auth', 'jwt', 'Bearer', 'cloudnest-token', 'cloudnest-auth', 'authToken'
    ];

    for (const key of possibleKeys) {
        const token = localStorage.getItem(key) || sessionStorage.getItem(key);

        if (token) return token;
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
    userEmail = 'user@example.com',
}) => {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAccessOptions, setShowAccessOptions] = useState(false);
    const accessOptionsRef = useRef<HTMLDivElement>(null);
    const [toastMessage, setToastMessage] = useState<string>('Link copied');
    const [userData, setUserData] = useState({ name: userName, email: userEmail });

    // States for AI scanning functionality
    const [showScanModal, setShowScanModal] = useState(false);
    const [showSensitiveAlert, setShowSensitiveAlert] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [pendingPublicStatus, setPendingPublicStatus] = useState<boolean | null>(null);

    const userInitial = userData.name.charAt(0).toUpperCase();

    const fadeInAnimation = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `;

    useEffect(() => {
        if (isOpen) {
            setIsCopied(false);
            setShowAccessOptions(false);
            setIsPublic(initialIsPublic);
        }
    }, [isOpen, initialIsPublic]);

    useEffect(() => {
        try {
            const storedUserData = localStorage.getItem('user');
            if (storedUserData && userName === 'User') {
                const parsedUserData = JSON.parse(storedUserData);
                if (parsedUserData?.name) {
                    setUserData({
                        name: parsedUserData.name || userName,
                        email: parsedUserData.email || userEmail,
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to get user data from local storage:', error);
        }
    }, [userName, userEmail]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accessOptionsRef.current && !accessOptionsRef.current.contains(event.target as Node)) {
                setShowAccessOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const setPublicAccess = async (makePublic: boolean) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication required. Please log in.');
            return;
        }

        // If making file public, trigger AI scan first
        if (makePublic && !isPublic) {
            setPendingPublicStatus(makePublic);
            setShowScanModal(true);
            return;
        }

        // If making file private or already public, proceed directly
        await updateFileAccess(makePublic);
    };

    const updateFileAccess = async (makePublic: boolean) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication required. Please log in.');
            return;
        }

        try {
            setIsLoading(true);
            setIsPublic(makePublic);
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            const response = await axios.put(
                `${API_BASE_URL}/api/files/${fileId}/public`,
                { isPublic: makePublic },
                { headers, withCredentials: true }
            );
            const responseData = response.data as FileApiResponse;
            if (responseData?.success && responseData.data?.isPublic === makePublic) {
                // Success - no additional action needed
            } else {
                console.warn('API response mismatch or failure:', responseData);
                setIsPublic(!makePublic);
            }
            setShowAccessOptions(false);
        } catch (error) {
            console.error('Error updating file access:', error);
            setIsPublic(!makePublic);
            const err = error as ApiError;
            if (err.response?.status === 401) {
                alert('Authentication error. Please log in.');
                window.location.href = '/login';
            } else {
                alert(`Error: ${(err.response?.data as { message?: string })?.message || 'Failed to update access settings.'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleScanComplete = (result: ScanResult) => {
        setScanResult(result);
        setShowScanModal(false);

        if (result.containsSensitiveData) {
            setShowSensitiveAlert(true);
        } else {
            // No sensitive data found, proceed with making public
            if (pendingPublicStatus !== null) {
                updateFileAccess(pendingPublicStatus);
                setPendingPublicStatus(null);
            }
        }
    };

    const handleProceedPublic = async () => {
        setShowSensitiveAlert(false);
        if (pendingPublicStatus !== null) {
            await updateFileAccess(pendingPublicStatus);
            setPendingPublicStatus(null);
        }
    };

    const handleKeepPrivate = () => {
        setShowSensitiveAlert(false);
        setPendingPublicStatus(null);
        setIsPublic(false); // Keep file private
        setShowAccessOptions(false);
    };

    const handleCloseScanModal = () => {
        setShowScanModal(false);
        setPendingPublicStatus(null);
        setIsPublic(false); // Revert to private if scan is cancelled
    };

    const handleCloseSensitiveAlert = () => {
        setShowSensitiveAlert(false);
        setPendingPublicStatus(null);
        setIsPublic(false); // Revert to private if alert is cancelled
        setShowAccessOptions(false);
    };

    const copyLink = async () => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication required. Please log in.');
            window.location.href = '/login';
            return;
        }

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            // Try the new /info endpoint first
            let response;
            try {
                response = await axios.get(`${API_BASE_URL}/api/files/${fileId}/info`, {
                    headers,
                    withCredentials: true,
                });
            } catch {

                // Fallback to original endpoint with format=json
                response = await axios.get(`${API_BASE_URL}/api/files/${fileId}?format=json`, {
                    headers: {
                        ...headers,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                });
            }

            const responseData = response.data as FileApiResponse;
            if (!responseData || (!responseData.data && !('filename' in responseData))) {
                throw new Error('Invalid file data received');
            }

            // Type-safe access to file data
            const fileData = responseData.data || responseData;
            const filename = String((fileData as Record<string, unknown>).filename || (fileData as Record<string, unknown>).originalname || 'unknown_file');
            const mimetype = String((fileData as Record<string, unknown>).mimetype || '');
            const isFilePublic = (fileData as Record<string, unknown>).isPublic === true;

            // Use the backend proxy endpoint
            let link = `${API_BASE_URL}/api/files/proxy/${encodeURIComponent(filename)}`;

            if (mimetype.includes('presentation') || mimetype.includes('powerpoint') || filename.endsWith('.ppt') || filename.endsWith('.pptx')) {
                link = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link)}`;
                setToastMessage(isFilePublic ? 'PowerPoint viewer link copied' : 'PowerPoint viewer link copied (expires in 1 hour)');
            } else if (mimetype.includes('pdf') || filename.endsWith('.pdf')) {
                setToastMessage(isFilePublic ? 'PDF link copied' : 'PDF link copied (expires in 1 hour)');
            } else if (mimetype.includes('image')) {
                setToastMessage(isFilePublic ? 'Image link copied' : 'Image link copied (expires in 1 hour)');
            } else {
                setToastMessage(isFilePublic ? 'File link copied' : 'File link copied (expires in 1 hour)');
            }

            navigator.clipboard.writeText(link);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);

        } catch (error) {
            console.error('Error getting file access link:', error);
            const err = error as ApiError;
            if (err.response?.status === 401) {
                alert('Authentication error. Please log in.');

            } else {
                const frontendHost = window.location.origin;
                const fallbackLink = `${frontendHost}/files/preview/${fileId}`;
                navigator.clipboard.writeText(fallbackLink);
                setToastMessage('Link Copies');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white/70 z-[300] flex items-center justify-center" onClick={onClose}>
            <style dangerouslySetInnerHTML={{ __html: fadeInAnimation }} />
            <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Share</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
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
                                                        <div className="font-medium text-black">Anyone with the link</div>
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
                                    {isPublic ? 'Anyone on the internet with the link can view' : 'Link will expire in 1 hour for security'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
                    <div className="relative">
                        <button
                            onClick={copyLink}
                            className={`inline-flex items-center px-4 py-2 border ${isPublic ? 'border-blue-300' : 'border-gray-300'} rounded-md shadow-sm text-sm font-medium ${isPublic ? 'text-blue-700' : 'text-gray-500'} ${isPublic ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            <svg className={`w-4 h-4 mr-2 ${isPublic ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {isPublic ? 'Copy Public Link' : 'Copy Private Link'}
                        </button>
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

            {/* AI Scan Modal */}
            <ScanWithAI
                fileId={fileId}
                filename={userData.name || 'Unknown File'}
                onScanComplete={handleScanComplete}
                onClose={handleCloseScanModal}
                isOpen={showScanModal}
            />

            {/* Sensitive Data Alert Modal */}
            {scanResult && (
                <SensitiveDataAlert
                    scanResult={scanResult}
                    filename={userData.name || 'Unknown File'}
                    onProceedPublic={handleProceedPublic}
                    onKeepPrivate={handleKeepPrivate}
                    onClose={handleCloseSensitiveAlert}
                    isOpen={showSensitiveAlert}
                />
            )}
        </div>
    );
};

export default ShareModal;