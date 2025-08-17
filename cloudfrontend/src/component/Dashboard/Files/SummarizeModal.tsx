import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface SummarizeModalProps {
    file: {
        _id: string;
        filename: string;
        originalname: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

const SummarizeModal: React.FC<SummarizeModalProps> = ({ file, isOpen, onClose }) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen && file) {
            handleSummarize();
        }
    }, [isOpen, file]); // eslint-disable-line react-hooks/exhaustive-deps

    // Parse summary into structured sections
    const parseSummary = (summaryText: string) => {
        if (!summaryText) return null;

        const sections = {
            title: '',
            overview: '',
            keyPoints: [] as string[],
            details: '',
            conclusion: ''
        };

        // Split summary into paragraphs
        const paragraphs = summaryText.split('\n').filter(p => p.trim());

        // Extract title from filename or first meaningful sentence
        sections.title = `AI Summary: ${file?.originalname || 'Document'}`;

        // Process paragraphs to extract different sections
        let currentSection = 'overview';
        let keyPointsStarted = false;

        paragraphs.forEach((paragraph, index) => {
            const trimmedParagraph = paragraph.trim();
            const lowerParagraph = trimmedParagraph.toLowerCase();

            // Check for section indicators
            if (lowerParagraph.includes('key point') || lowerParagraph.includes('main point') ||
                lowerParagraph.includes('important') || lowerParagraph.includes('highlight') ||
                (index > 0 && index < paragraphs.length - 1 && trimmedParagraph.length < 100)) {
                keyPointsStarted = true;
                currentSection = 'keyPoints';
                if (trimmedParagraph.length > 20) {
                    sections.keyPoints.push(trimmedParagraph);
                }
            } else if (lowerParagraph.includes('conclusion') || lowerParagraph.includes('summary') ||
                lowerParagraph.includes('in conclusion') || index === paragraphs.length - 1) {
                currentSection = 'conclusion';
                sections.conclusion += (sections.conclusion ? ' ' : '') + trimmedParagraph;
            } else if (currentSection === 'keyPoints' && keyPointsStarted) {
                sections.keyPoints.push(trimmedParagraph);
            } else if (currentSection === 'overview' && index < 2) {
                sections.overview += (sections.overview ? ' ' : '') + trimmedParagraph;
            } else {
                sections.details += (sections.details ? ' ' : '') + trimmedParagraph;
            }
        });

        // If no key points were found, extract them from the content
        if (sections.keyPoints.length === 0) {
            const sentences = summaryText.split('.').filter(s => s.trim().length > 30);
            sections.keyPoints = sentences.slice(1, Math.min(4, sentences.length)).map(s => s.trim() + '.');
        }

        return sections;
    };

    const structuredSummary = summary ? parseSummary(summary) : null;

    const handleSummarize = async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setSummary('');

        console.log('🔍 Starting summarization for file:', {
            id: file._id,
            originalname: file.originalname,
            filename: file.filename
        });

        try {
            // First try to get existing summary
            let response;
            try {
                response = await api.files.getSummary(file._id);
                console.log('✅ Found existing summary:', response.data);

                if (response.data.success) {
                    setSummary(response.data.data.summary);
                    return;
                }
            } catch {
                console.log('ℹ️ No existing summary found, generating new one...');
            }

            // Generate new summary if none exists
            response = await api.files.summarize(file._id);
            console.log('✅ Summarize response:', response.data);

            if (response.data.success) {
                setSummary(response.data.data.summary);
            } else {
                setError('Failed to generate summary');
            }
        } catch (err: unknown) {
            console.error('❌ Summarize error:', err);
            console.error('❌ Error response:', (err as Record<string, unknown>).response);
            const errorMessage = err instanceof Error && 'response' in err && err.response && 
                typeof err.response === 'object' && 'data' in err.response && 
                err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
                ? String(err.response.data.message)
                : 'Failed to generate summary. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!summary || !file) return;

        try {
            const structuredSummary = parseSummary(summary);

            // Create formatted text content
            let formattedContent = `${structuredSummary?.title || `AI Summary: ${file.originalname}`}\n`;
            formattedContent += `${'='.repeat(formattedContent.length - 1)}\n\n`;

            if (structuredSummary?.overview) {
                formattedContent += `📄 DOCUMENT OVERVIEW\n`;
                formattedContent += `${'-'.repeat(20)}\n`;
                formattedContent += `${structuredSummary.overview}\n\n`;
            }

            if (structuredSummary?.keyPoints && structuredSummary.keyPoints.length > 0) {
                formattedContent += `🔑 KEY HIGHLIGHTS\n`;
                formattedContent += `${'-'.repeat(20)}\n`;
                structuredSummary.keyPoints.forEach((point, index) => {
                    formattedContent += `${index + 1}. ${point}\n`;
                });
                formattedContent += `\n`;
            }

            if (structuredSummary?.details) {
                formattedContent += `📋 DETAILED CONTENT\n`;
                formattedContent += `${'-'.repeat(20)}\n`;
                formattedContent += `${structuredSummary.details}\n\n`;
            }

            if (structuredSummary?.conclusion) {
                formattedContent += `💡 CONCLUSION\n`;
                formattedContent += `${'-'.repeat(20)}\n`;
                formattedContent += `${structuredSummary.conclusion}\n\n`;
            }

            formattedContent += `\n${'-'.repeat(50)}\n`;
            formattedContent += `Generated by CloudNest AI on ${new Date().toLocaleDateString()}\n`;
            formattedContent += `Original File: ${file.originalname}\n`;

            const blob = new Blob([formattedContent], {
                type: 'text/plain;charset=utf-8'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${file.originalname.replace(/\.[^/.]+$/, '')}_AI_Summary.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-8a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">AI Summary</h2>
                            <p className="text-sm text-gray-500 truncate max-w-md">
                                {file?.originalname}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {summary && (
                            <>
                                <button
                                    onClick={handleDownload}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Summary
                                </button>

                                <button
                                    onClick={() => {
                                        setSummary('');
                                        handleSummarize();
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Regenerate
                                </button>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                                <p className="text-gray-600">Generating AI summary...</p>
                                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Summary Failed</h3>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={handleSummarize}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : summary ? (
                        <div className="h-full">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Document Summary</h3>
                                <span className="text-sm text-gray-500">
                                    {summary.split(' ').length} words • AI Generated
                                </span>
                            </div>

                            {structuredSummary && (
                                <div className="bg-gray-50 rounded-lg p-6 h-96 overflow-y-auto space-y-6 summary-scrollable"
                                    style={{ maxHeight: 'calc(70vh - 200px)' }}>
                                    {/* Title Section */}
                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                            📄 {structuredSummary.title}
                                        </h4>
                                    </div>

                                    {/* Overview Section */}
                                    {structuredSummary.overview && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h5 className="flex items-center text-md font-medium text-gray-800 mb-3">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                Document Overview
                                            </h5>
                                            <p className="text-gray-700 leading-relaxed">
                                                {structuredSummary.overview}
                                            </p>
                                        </div>
                                    )}

                                    {/* Key Points Section */}
                                    {structuredSummary.keyPoints.length > 0 && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h5 className="flex items-center text-md font-medium text-gray-800 mb-3">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                Key Highlights
                                            </h5>
                                            <ul className="space-y-2">
                                                {structuredSummary.keyPoints.slice(0, 5).map((point, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 mr-3">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-gray-700 leading-relaxed">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Details Section */}
                                    {structuredSummary.details && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h5 className="flex items-center text-md font-medium text-gray-800 mb-3">
                                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                                Detailed Content
                                            </h5>
                                            <p className="text-gray-700 leading-relaxed">
                                                {structuredSummary.details}
                                            </p>
                                        </div>
                                    )}

                                    {/* Conclusion Section */}
                                    {structuredSummary.conclusion && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                            <h5 className="flex items-center text-md font-medium text-purple-800 mb-3">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                Conclusion
                                            </h5>
                                            <p className="text-purple-700 leading-relaxed font-medium">
                                                {structuredSummary.conclusion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Full Summary Fallback */}
                                    {!structuredSummary.overview && !structuredSummary.details && !structuredSummary.conclusion && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h5 className="flex items-center text-md font-medium text-gray-800 mb-3">
                                                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                                Summary
                                            </h5>
                                            <div className="prose prose-gray max-w-none">
                                                {summary.split('\n').map((paragraph, index) => (
                                                    paragraph.trim() ? (
                                                        <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                                                            {paragraph}
                                                        </p>
                                                    ) : null
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fallback for when summary exists but no structured summary */}
                            {!structuredSummary && summary && (
                                <div className="bg-gray-50 rounded-lg p-6 h-96 overflow-y-auto summary-scrollable"
                                    style={{ maxHeight: 'calc(70vh - 200px)' }}>
                                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                                        <h5 className="flex items-center text-lg font-medium text-gray-800 mb-4">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                                            📄 AI Generated Summary
                                        </h5>
                                        <div className="prose prose-gray max-w-none">
                                            {summary.split('\n').map((paragraph, index) => (
                                                paragraph.trim() ? (
                                                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                                                        {paragraph}
                                                    </p>
                                                ) : null
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Summarize</h3>
                                <p className="text-gray-600">Click the button below to generate an AI summary of this file.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummarizeModal;
