import React, { useState } from 'react';
import { api } from '@/utils/api';

interface ScanResult {
    containsSensitiveData: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    sensitiveDataTypes: string[];
    details: string[];
    recommendation: string;
}

interface ScanWithAIProps {
    fileId: string;
    filename: string;
    onScanComplete: (result: ScanResult) => void;
    onClose: () => void;
    isOpen: boolean;
}

const ScanWithAI: React.FC<ScanWithAIProps> = ({
    fileId,
    filename,
    onScanComplete,
    onClose,
    isOpen
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>('');
    const [scanCompleted, setScanCompleted] = useState(false);

    const performScan = async () => {
        setIsScanning(true);
        setError('');
        setScanCompleted(false);

        try {
            const response = await api.files.scanSensitiveData(fileId);

            if (response.data.success) {
                setScanCompleted(true);
                // Wait a moment to show success, then notify parent
                setTimeout(() => {
                    onScanComplete(response.data.data.scanResult);
                }, 1000);
            } else {
                setError(response.data.message || 'Failed to scan file');
            }
        } catch (error) {
            console.error('Error scanning file:', error);
            setError('Failed to scan file for sensitive data. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setIsScanning(false);
            setError('');
            setScanCompleted(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[400] flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-[500px] max-w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Scan with AI</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">File:</span>
                            <span className="ml-2 text-sm text-gray-900">{filename}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-blue-800 mb-1">About AI Scanning</h3>
                                <p className="text-sm text-blue-700">
                                    Our AI will analyze your file content to detect potentially sensitive information such as:
                                </p>
                                <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                                    <li>Personal identifiers (SSN, passport numbers, etc.)</li>
                                    <li>Financial information (credit cards, bank accounts)</li>
                                    <li>Authentication credentials (passwords, API keys)</li>
                                    <li>Confidential or legal documents</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {scanCompleted && !error && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-green-700">Scan completed successfully! Checking results...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between">
                    <button
                        onClick={onClose}
                        disabled={isScanning}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                        {scanCompleted ? 'Close' : 'Cancel'}
                    </button>
                    <button
                        onClick={performScan}
                        disabled={isScanning || scanCompleted}
                        className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center"
                    >
                        {isScanning ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Scanning with AI...
                            </>
                        ) : scanCompleted ? (
                            <>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Scan Completed
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start AI Scan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScanWithAI;
