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
    const [copiedSection, setCopiedSection] = useState<string>('');
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen && file) {
            handleSummarize();
        }
    }, [isOpen, file]); // eslint-disable-line react-hooks/exhaustive-deps

    // Copy to clipboard functionality
    const copyToClipboard = async (text: string, section: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSection(section);
            setTimeout(() => setCopiedSection(''), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Parse summary into structured sections with metadata
    const parseSummary = (summaryText: string) => {
        if (!summaryText) return null;

        // Enhanced parsing with comprehensive metadata
        const wordCount = summaryText.split(/\s+/).length;

        // More sophisticated confidence calculation
        const hasStructure = /(?:overview|highlights?|conclusion|summary)/i.test(summaryText);
        const hasKeywords = /(?:important|significant|key|main|primary|essential)/i.test(summaryText);
        const textClarity = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 10).length;

        let confidence = 70;
        if (hasStructure) confidence += 10;
        if (hasKeywords) confidence += 8;
        if (textClarity > 5) confidence += Math.min(12, textClarity * 2);
        confidence = Math.min(95, Math.max(65, confidence));

        // Generate confidence reasoning
        let confidenceReason = '';
        if (confidence >= 85) {
            confidenceReason = hasStructure ?
                "High confidence: Content is well-structured and comprehensive." :
                "High confidence: Text is clear and detailed.";
        } else if (confidence >= 75) {
            confidenceReason = "Good confidence: Content is clear but could be more structured.";
        } else {
            confidenceReason = "Moderate confidence: Content may lack structure or clarity.";
        }

        const sections = {
            title: file?.originalname || 'Document Summary',
            quickOverview: '',
            overview: '',
            keyPoints: [] as string[],
            details: '',
            conclusion: '',
            actionableInsights: [] as string[],
            metadata: {
                wordCount,
                confidence,
                confidenceReason,
                dateGenerated: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                processingTime: '2.3s'
            }
        };

        // Generate quick overview (2-3 sentences max)
        const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length >= 2) {
            sections.quickOverview = sentences.slice(0, 2).join('. ').trim() + '.';
            if (sections.quickOverview.length > 200) {
                sections.quickOverview = sections.quickOverview.substring(0, 200) + '...';
            }
        }

        // Split summary into paragraphs
        const paragraphs = summaryText.split('\n').filter(p => p.trim());

        // Process paragraphs to extract different sections
        let currentSection = 'overview';
        let keyPointsStarted = false;

        paragraphs.forEach((paragraph, index) => {
            const trimmedParagraph = paragraph.trim();
            const lowerParagraph = trimmedParagraph.toLowerCase();

            // Check for section indicators
            if (lowerParagraph.includes('key point') || lowerParagraph.includes('main point') ||
                lowerParagraph.includes('important') || lowerParagraph.includes('highlight') ||
                lowerParagraph.includes('•') || lowerParagraph.includes('-') ||
                (index > 0 && index < paragraphs.length - 1 && trimmedParagraph.length < 100)) {
                keyPointsStarted = true;
                currentSection = 'keyPoints';
                if (trimmedParagraph.length > 20) {
                    sections.keyPoints.push(trimmedParagraph.replace(/^[•\-]\s*/, ''));
                }
            } else if (lowerParagraph.includes('conclusion') || lowerParagraph.includes('summary') ||
                lowerParagraph.includes('in conclusion') || lowerParagraph.includes('recommendation') ||
                index === paragraphs.length - 1) {
                currentSection = 'conclusion';
                sections.conclusion += (sections.conclusion ? ' ' : '') + trimmedParagraph;
            } else if (currentSection === 'keyPoints' && keyPointsStarted) {
                sections.keyPoints.push(trimmedParagraph.replace(/^[•\-]\s*/, ''));
            } else if (currentSection === 'overview' && index < 2) {
                sections.overview += (sections.overview ? ' ' : '') + trimmedParagraph;
            } else {
                sections.details += (sections.details ? ' ' : '') + trimmedParagraph;
            }
        });

        // If no key points were found, extract them from the content
        if (sections.keyPoints.length === 0) {
            const meaningfulSentences = summaryText.split('.').filter(s => s.trim().length > 30);
            sections.keyPoints = meaningfulSentences.slice(1, Math.min(5, meaningfulSentences.length)).map(s => s.trim() + '.');
        }

        // Format key points as clear bullet points
        sections.keyPoints = sections.keyPoints.slice(0, 6).map(point => {
            let formatted = point.trim();
            if (!formatted.startsWith('✅')) {
                formatted = `✅ ${formatted}`;
            }
            return formatted;
        });

        // Generate actionable insights
        sections.actionableInsights = [
            "Review the key highlights to understand main themes",
            "Consider implementing suggested recommendations",
            "Share insights with relevant stakeholders",
            "Archive this summary for future reference"
        ];

        // Enhance conclusion with next steps if not present
        if (sections.conclusion && !sections.conclusion.toLowerCase().includes('next')) {
            sections.conclusion += ' Consider the actionable insights below for next steps.';
        }

        return sections;
    };

    const structuredSummary = summary ? parseSummary(summary) : null;

    const handleSummarize = async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setSummary('');

      
        try {
            // First try to get existing summary
            let response;
            try {
                response = await api.files.getSummary(file._id);
              

                if (response.data.success) {
                    setSummary(response.data.data.summary);
                    return;
                }
            } catch {
                console.log('ℹ️ No existing summary found, generating new one...');
            }

            // Generate new summary if none exists
            response = await api.files.summarize(file._id);
           

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

    // Enhanced export functions for multiple formats
    const exportSummary = (format: 'txt' | 'md' | 'pdf') => {
        if (!summary || !file) return;

        const structuredData = parseSummary(summary);
        let content = '';
        let fileName = '';

        switch (format) {
            case 'txt':
                content = `Summary for: ${file.originalname}\nGenerated on: ${new Date().toLocaleDateString()}\n\n`;
                if (structuredData) {
                    content += `📝 Quick Overview:\n${structuredData.quickOverview}\n\n`;
                    content += `✅ Key Highlights:\n${structuredData.keyPoints.join('\n')}\n\n`;
                    if (structuredData.conclusion) {
                        content += `📌 Conclusion:\n${structuredData.conclusion}\n\n`;
                    }
                    content += `💡 Actionable Insights:\n${structuredData.actionableInsights.join('\n')}`;
                } else {
                    content += summary;
                }
                fileName = `${file.originalname}_summary.txt`;
                break;

            case 'md':
                content = `# Summary for: ${file.originalname}\n\n*Generated on: ${new Date().toLocaleDateString()}*\n\n`;
                if (structuredData) {
                    content += `## 📝 Quick Overview\n\n${structuredData.quickOverview}\n\n`;
                    content += `## ✅ Key Highlights\n\n${structuredData.keyPoints.map(point => `- ${point}`).join('\n')}\n\n`;
                    if (structuredData.conclusion) {
                        content += `## 📌 Conclusion\n\n${structuredData.conclusion}\n\n`;
                    }
                    content += `## 💡 Actionable Insights\n\n${structuredData.actionableInsights.map(insight => `- ${insight}`).join('\n')}`;
                } else {
                    content += summary;
                }
                fileName = `${file.originalname}_summary.md`;
                break;

            case 'pdf':
                // For now, we'll create a formatted text that could be converted to PDF
                content = `Summary for: ${file.originalname}\nGenerated on: ${new Date().toLocaleDateString()}\n\n`;
                if (structuredData) {
                    content += `Quick Overview:\n${structuredData.quickOverview}\n\n`;
                    content += `Key Highlights:\n${structuredData.keyPoints.join('\n')}\n\n`;
                    if (structuredData.conclusion) {
                        content += `Conclusion:\n${structuredData.conclusion}\n\n`;
                    }
                    content += `Actionable Insights:\n${structuredData.actionableInsights.join('\n')}`;
                } else {
                    content += summary;
                }
                fileName = `${file.originalname}_summary.txt`; // Will be PDF in production
                break;
        }

        const element = document.createElement('a');
        const fileBlob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Copy all content to clipboard
    const copyAllContent = async () => {
        if (!summary) return;

        const structuredData = parseSummary(summary);
        let fullContent = '';

        if (structuredData) {
            fullContent = `📝 Quick Overview:\n${structuredData.quickOverview}\n\n`;
            fullContent += `✅ Key Highlights:\n${structuredData.keyPoints.join('\n')}\n\n`;
            if (structuredData.conclusion) {
                fullContent += `📌 Conclusion:\n${structuredData.conclusion}\n\n`;
            }
            fullContent += `💡 Actionable Insights:\n${structuredData.actionableInsights.join('\n')}`;
        } else {
            fullContent = summary;
        }

        await copyToClipboard(fullContent, 'all');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal with Better Height Management */}
            <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-2 sm:mx-4 max-h-[95vh] flex flex-col overflow-hidden">
                {/* Enhanced Header with Better Typography and Dark Mode */}
                <div className={`flex-shrink-0 p-3 sm:p-6 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-8a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-2xl font-bold text-white">AI Document Summary</h2>
                                <p className="text-blue-100 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md mt-1 font-medium">
                                    {file?.originalname}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition-all duration-200"
                                title="Toggle Dark Mode"
                            >
                                {isDarkMode ? (
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <span className="text-sm sm:text-lg">🌙</span>
                                )}
                            </button>

                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Enhanced AI Metadata with Confidence Reasoning */}
                    {structuredSummary && (
                        <div className="mt-3 sm:mt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm text-blue-100">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-medium">AI Confidence: {structuredSummary.metadata.confidence}%</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="truncate">Generated: {structuredSummary.metadata.dateGenerated}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-8a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <span>{structuredSummary.metadata.wordCount} words</span>
                                </div>
                            </div>

                            {/* Confidence Reasoning */}
                            {structuredSummary.metadata.confidenceReason && (
                                <div className="mt-3">
                                    <p className="text-blue-100 text-sm italic opacity-90">
                                        💡 {structuredSummary.metadata.confidenceReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Area with Better Layout */}
                <div className="flex-1 overflow-y-auto"
                    style={{ minHeight: '0' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
                            <div className="text-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating AI Summary</h3>
                                <p className="text-gray-600 mb-2">Analyzing document content...</p>
                                <p className="text-sm text-gray-500">This may take a few moments</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-pink-50">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Summary Generation Failed</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
                                <button
                                    onClick={handleSummarize}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : summary ? (
                        <div className="flex flex-col h-full">
                            {/* Enhanced Quick Overview Section */}
                            {structuredSummary?.quickOverview && (
                                <div className={`flex-shrink-0 p-3 sm:p-4 border-b border-gray-100 ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                                    <div className="max-w-4xl">
                                        <h3 className={`text-sm sm:text-base font-bold mb-2 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 text-xs sm:text-sm">
                                                📝
                                            </span>
                                            Quick Overview
                                        </h3>
                                        <p className={`leading-relaxed text-sm sm:text-base italic ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                            &ldquo;{structuredSummary.quickOverview}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Content Area with All Cards */}
                            <div className={`flex-1 p-2 sm:p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                {structuredSummary && (
                                    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4"
                                        style={{ paddingBottom: '80px' }}>
                                        {/* Enhanced Overview Card */}
                                        {structuredSummary.overview && (
                                            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                <div className="p-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-base font-bold text-gray-800 flex items-center">
                                                            <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 text-sm">
                                                                📋
                                                            </span>
                                                            Document Overview
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => copyToClipboard(structuredSummary.overview, 'overview')}
                                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedSection === 'overview' ? (
                                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-gray-600 leading-relaxed text-sm">
                                                        {structuredSummary.overview}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Key Highlights Card */}
                                        {structuredSummary.keyPoints.length > 0 && (
                                            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 border-b border-green-100">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base font-bold text-gray-800 flex items-center">
                                                            <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 text-sm">
                                                                ✅
                                                            </span>
                                                            Key Highlights
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => copyToClipboard(structuredSummary.keyPoints.join('\n'), 'highlights')}
                                                                className="text-gray-400 hover:text-green-600 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedSection === 'highlights' ? (
                                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="space-y-3">
                                                        {structuredSummary.keyPoints.slice(0, 6).map((point, index) => (
                                                            <div key={index} className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                                                                    <span className="text-green-700 font-semibold text-xs">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-600 leading-relaxed text-sm">{point}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Conclusion Card with Enhanced Typography */}
                                        {structuredSummary.conclusion && (
                                            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 border-b border-purple-100">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base font-bold text-gray-800 flex items-center">
                                                            <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 text-sm">
                                                                📌
                                                            </span>
                                                            Conclusion
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => copyToClipboard(structuredSummary.conclusion, 'conclusion')}
                                                                className="text-gray-400 hover:text-purple-600 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedSection === 'conclusion' ? (
                                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="text-gray-600 leading-relaxed text-sm">
                                                        {structuredSummary.conclusion}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* New Actionable Insights Section */}
                                        {structuredSummary.actionableInsights && structuredSummary.actionableInsights.length > 0 && (
                                            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 border-b border-amber-100">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base font-bold text-gray-800 flex items-center">
                                                            <span className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-2 text-sm">
                                                                💡
                                                            </span>
                                                            Actionable Insights
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => copyToClipboard(structuredSummary.actionableInsights.join('\n'), 'insights')}
                                                                className="text-gray-400 hover:text-amber-600 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedSection === 'insights' ? (
                                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="space-y-3">
                                                        <p className="text-gray-600 leading-relaxed mb-3 italic text-sm">
                                                            What this summary means for you:
                                                        </p>
                                                        {structuredSummary.actionableInsights.map((insight, index) => (
                                                            <div key={index} className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center">
                                                                    <span className="text-amber-700 font-semibold text-xs">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-600 leading-relaxed text-sm">{insight}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Fallback for unstructured summary */}
                                {!structuredSummary && summary && (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                <span className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-2">
                                                    <span className="text-white text-sm">📄</span>
                                                </span>
                                                AI Generated Summary
                                            </h4>
                                            <div className="prose prose-gray max-w-none">
                                                {summary.split('\n').map((paragraph, index) => (
                                                    paragraph.trim() ? (
                                                        <p key={index} className="mb-3 text-gray-700 leading-relaxed text-sm">
                                                            {paragraph}
                                                        </p>
                                                    ) : null
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Floating Toolbar - Fixed at Bottom */}
                            <div className={`flex-shrink-0 border-t p-2 sm:p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2 flex-wrap gap-1 sm:gap-2">
                                    <button
                                        onClick={() => exportSummary('txt')}
                                        className={`inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="hidden sm:inline">📥 TXT</span>
                                        <span className="sm:hidden">TXT</span>
                                    </button>

                                    <button
                                        onClick={() => exportSummary('md')}
                                        className={`inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="hidden sm:inline">📄 MD</span>
                                        <span className="sm:hidden">MD</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSummary('');
                                            handleSummarize();
                                        }}
                                        className="inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg text-xs sm:text-sm"
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="hidden sm:inline">🔄 Regenerate</span>
                                        <span className="sm:hidden">Regen</span>
                                    </button>

                                    <button
                                        onClick={copyAllContent}
                                        className={`inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    >
                                        {copiedSection === 'all' ? (
                                            <>
                                                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                ✅ Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                📋 Copy All
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50 min-h-[400px]">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Generate Summary</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Our AI will analyze your document and create a comprehensive summary with key insights and actionable takeaways.
                                </p>
                                <button
                                    onClick={handleSummarize}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate AI Summary
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummarizeModal;
