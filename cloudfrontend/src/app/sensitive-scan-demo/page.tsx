"use client";

import React, { useState } from 'react';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import { api } from '@/utils/api';
import Toast from '@/component/common/Toast';

interface ScanResult {
    containsSensitiveData: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    sensitiveDataTypes: string[];
    details: string[];
    recommendation: string;
}

export default function SensitiveDataScanDemoPage() {
    const [textContent, setTextContent] = useState('');
    const [filename, setFilename] = useState('demo-document.txt');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const performScan = async () => {
        if (!textContent.trim()) {
            setError('Please enter some text to scan');
            return;
        }

        setIsScanning(true);
        setError('');
        setScanResult(null);

        try {
            // Create a temporary file ID for demo purposes
            const tempFileId = 'demo-file-id';

            // Since this is a demo, we'll call the scanning service directly
            // In a real scenario, this would be done through the actual file API
            const response = await api.files.scanSensitiveData(tempFileId, textContent);

            if (response.data.success) {
                setScanResult(response.data.data.scanResult);
                showToastMessage('Scan completed successfully!', 'success');
            } else {
                setError(response.data.message || 'Failed to scan content');
                showToastMessage('Failed to scan content', 'error');
            }
        } catch (error) {
            console.error('Scan error:', error);
            setError('Failed to scan content. Please try again.');
            showToastMessage('Scan failed. Please try again.', 'error');
        } finally {
            setIsScanning(false);
        }
    };

    const sampleTexts = [
        {
            title: 'Financial Document (High Risk)',
            content: `Financial Summary Report
            
Account Number: 123456789012
Credit Card: 4532 1234 5678 9012
Social Security: 123-45-6789
Monthly Salary: $75,000
Tax ID: 98-7654321

This document contains sensitive financial information including account numbers, credit card details, and personal identifiers.`
        },
        {
            title: 'Login Credentials (High Risk)',
            content: `System Access Information
            
Username: john.doe@company.com
Password: MySecure123!
API Key: sk-1234567890abcdef1234567890abcdef
Database URL: postgresql://user:password@localhost:5432/db
Private Key: -----BEGIN RSA PRIVATE KEY-----

This document contains authentication credentials that should never be shared publicly.`
        },
        {
            title: 'Personal Information (Medium Risk)',
            content: `Personal Profile
            
Name: John Doe
Email: john.doe@gmail.com
Phone: (555) 123-4567
Address: 123 Main Street, City, State 12345
Date of Birth: 01/15/1990
Driver's License: D123456789

This document contains personal information that could be used for identity theft.`
        },
        {
            title: 'Medical Records (High Risk)',
            content: `Medical Record Summary
            
Patient ID: P123456
Insurance Number: INS-789-123-456
Medicare Number: 1EG4-TE5-MK73
Diagnosis: Type 2 Diabetes
Prescription: Metformin 500mg
Doctor: Dr. Smith, Internal Medicine

This document contains protected health information (PHI) under HIPAA regulations.`
        },
        {
            title: 'Legal Document (Medium Risk)',
            content: `CONFIDENTIAL - Attorney-Client Privileged
            
Non-Disclosure Agreement
            
This document contains confidential information protected by attorney-client privilege. The contents are proprietary and confidential trade secrets.
            
Contract Terms:
- Confidentiality period: 5 years
- Penalty for disclosure: $50,000
- Governing law: California

This document contains legally privileged information.`
        },
        {
            title: 'Regular Document (Low Risk)',
            content: `Meeting Minutes - Marketing Team
            
Date: March 15, 2024
Attendees: Marketing Team
            
Agenda Items:
1. Q2 Marketing Campaign Planning
2. Social Media Strategy Update
3. Budget Allocation Review
4. Upcoming Events and Conferences

Action Items:
- Finalize campaign creative by March 30
- Submit budget proposal by April 1
- Schedule client presentations

This document contains general business information with no sensitive data.`
        }
    ];

    const getRiskBadgeColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
                <Toast
                    message={toastMessage}
                    type={toastType}
                    show={showToast}
                    onHide={() => setShowToast(false)}
                />

                <div className="p-6 max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sensitive Data Scanning Demo</h1>
                        <p className="text-gray-600">
                            Test the AI-powered sensitive data detection system with sample content or your own text.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Input Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Content</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sample Texts (Click to Use)
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {sampleTexts.map((sample, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setTextContent(sample.content);
                                                    setFilename(`sample-${index + 1}.txt`);
                                                }}
                                                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="font-medium text-sm text-gray-900">{sample.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 truncate">
                                                    {sample.content.substring(0, 100)}...
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filename
                                    </label>
                                    <input
                                        type="text"
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter filename"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Text Content
                                    </label>
                                    <textarea
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                        rows={12}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter or paste text content to scan for sensitive information..."
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="text-sm text-red-700">{error}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={performScan}
                                    disabled={isScanning || !textContent.trim()}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                                >
                                    {isScanning ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Scanning with AI...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Scan for Sensitive Data
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Scan Results</h2>

                            {!scanResult ? (
                                <div className="text-center py-12">
                                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500">Run a scan to see results here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Overall Result */}
                                    <div className={`border-l-4 pl-4 py-3 ${scanResult.containsSensitiveData
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-green-500 bg-green-50'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`font-medium ${scanResult.containsSensitiveData ? 'text-red-800' : 'text-green-800'
                                                }`}>
                                                {scanResult.containsSensitiveData ? 'Sensitive Data Detected' : 'No Sensitive Data Found'}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(scanResult.riskLevel)}`}>
                                                {scanResult.riskLevel} RISK
                                            </span>
                                        </div>
                                        <p className={`text-sm ${scanResult.containsSensitiveData ? 'text-red-700' : 'text-green-700'
                                            }`}>
                                            {scanResult.recommendation}
                                        </p>
                                    </div>

                                    {/* Confidence Score */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
                                            <span className="text-sm text-gray-900">{Math.round(scanResult.confidence * 100)}%</span>
                                        </div>
                                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${scanResult.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Detected Types */}
                                    {scanResult.sensitiveDataTypes.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Sensitive Data Types:</h4>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm text-gray-800">
                                                    {formatSensitiveTypes(scanResult.sensitiveDataTypes)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Details */}
                                    {scanResult.details.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Scan Details:</h4>
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
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">How Sensitive Data Scanning Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-medium mb-2">1. Pattern Matching</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Credit card numbers</li>
                                    <li>Social security numbers</li>
                                    <li>Phone numbers</li>
                                    <li>Email addresses</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">2. Keyword Detection</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Financial terms</li>
                                    <li>Authentication keywords</li>
                                    <li>Medical information</li>
                                    <li>Legal/confidential terms</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">3. AI Analysis</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Context understanding</li>
                                    <li>Semantic analysis</li>
                                    <li>Risk assessment</li>
                                    <li>Confidence scoring</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
