import React from 'react';

interface ScanResult {
    containsSensitiveData: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    sensitiveDataTypes: string[];
    details: string[];
    recommendation: string;
}

interface SensitiveDataAlertProps {
    scanResult: ScanResult;
    filename: string;
    onProceedPublic: () => void;
    onKeepPrivate: () => void;
    onClose: () => void;
    isOpen: boolean;
}

const SensitiveDataAlert: React.FC<SensitiveDataAlertProps> = ({
    scanResult,
    filename,
    onProceedPublic,
    onKeepPrivate,
    onClose,
    isOpen
}) => {
    if (!isOpen) return null;

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'HIGH': return 'red';
            case 'MEDIUM': return 'yellow';
            case 'LOW': return 'green';
            default: return 'gray';
        }
    };

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'HIGH':
                return (
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'MEDIUM':
                return (
                    <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'LOW':
                return (
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const formatSensitiveTypes = (types: string[]) => {
        return types.map(type => {
            switch (type) {
                case 'creditCard': return 'Credit Card Numbers';
                case 'ssn': return 'Social Security Numbers';
                case 'phone': return 'Phone Numbers';
                case 'email': return 'Email Addresses';
                case 'passport': return 'Passport Numbers';
                case 'driversLicense': return 'Driver\'s License Numbers';
                case 'bankAccount': return 'Bank Account Numbers';
                case 'password': return 'Passwords/Credentials';
                case 'apiKey': return 'API Keys';
                case 'sensitive-keywords': return 'Sensitive Keywords';
                case 'ai-detected': return 'AI-Detected Sensitive Content';
                default: return type.charAt(0).toUpperCase() + type.slice(1);
            }
        }).join(', ');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[500] flex items-center justify-center" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-[600px] max-w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                        {getRiskIcon(scanResult.riskLevel)}
                        <h2 className="text-lg font-semibold text-gray-900 ml-3">
                            {scanResult.containsSensitiveData ? 'Sensitive Data Detected' : 'Scan Complete'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    {/* File Info */}
                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">File:</span>
                            <span className="ml-2 text-sm text-gray-900">{filename}</span>
                        </div>
                    </div>

                    {/* Risk Level */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                                ${scanResult.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    scanResult.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'}`}>
                                {scanResult.riskLevel}
                            </span>
                        </div>
                        <div className="mt-1">
                            <span className="text-sm text-gray-600">
                                Confidence: {Math.round(scanResult.confidence * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`border-l-4 pl-4 py-3 mb-4 ${scanResult.containsSensitiveData
                            ? `border-${getRiskColor(scanResult.riskLevel)}-500 bg-${getRiskColor(scanResult.riskLevel)}-50`
                            : 'border-green-500 bg-green-50'
                        }`}>
                        <p className={`text-sm font-medium ${scanResult.containsSensitiveData
                                ? `text-${getRiskColor(scanResult.riskLevel)}-800`
                                : 'text-green-800'
                            }`}>
                            {scanResult.recommendation}
                        </p>
                    </div>

                    {/* Detected Sensitive Data Types */}
                    {scanResult.containsSensitiveData && scanResult.sensitiveDataTypes.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Detected Sensitive Data Types:</h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-800">
                                    {formatSensitiveTypes(scanResult.sensitiveDataTypes)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    {scanResult.details.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Scan Details:</h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {scanResult.details.map((detail, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Warning Message */}
                    {scanResult.containsSensitiveData && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <svg className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-orange-800 mb-1">Privacy Warning</h3>
                                    <p className="text-sm text-orange-700">
                                        Making this file public will allow anyone with the link to access it.
                                        Consider keeping files with sensitive information private to protect your privacy and security.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between">
                    <button
                        onClick={onKeepPrivate}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Keep Private
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onProceedPublic}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${scanResult.containsSensitiveData
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {scanResult.containsSensitiveData ? 'Make Public Anyway' : 'Make Public'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SensitiveDataAlert;
