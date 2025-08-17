'use client';

import React, { useState } from 'react';
import { api } from '@/utils/api';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import Toast from '@/component/common/Toast';

export default function AITaggingDemoPage() {
    const [sampleText, setSampleText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [error, setError] = useState<string>('');

    // Toast states
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');

    const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleTestAITagging = async () => {
        if (!sampleText.trim()) {
            showToastMessage('Please enter some text to test AI tagging', 'warning');
            return;
        }

        setIsLoading(true);
        setError('');
        setAiTags([]);

        try {
            const response = await api.files.testAITagging({
                text: sampleText,
                filename: 'demo-document.txt'
            });

            if (response.data.success && response.data.data.aiTaggingResult.success) {
                setAiTags(response.data.data.aiTaggingResult.tags);
                showToastMessage('AI tags generated successfully!', 'success');
            } else {
                setError(response.data.data.aiTaggingResult.error || 'Failed to generate AI tags');
                showToastMessage('Failed to generate AI tags', 'error');
            }
        } catch (error) {
            console.error('AI tagging error:', error);
            setError('Failed to generate AI tags. Please try again.');
            showToastMessage('Failed to generate AI tags', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const sampleTexts = [
        {
            title: 'Machine Learning Document',
            text: 'This document discusses machine learning algorithms, neural networks, and deep learning techniques for data analysis and pattern recognition. It covers topics like supervised learning, unsupervised learning, and reinforcement learning approaches.'
        },
        {
            title: 'Financial Report',
            text: 'Financial report for Q3 2024 showing revenue growth, profit margins, and market analysis for the technology sector. The report includes quarterly earnings, stock performance, and future projections.'
        },
        {
            title: 'Recipe Document',
            text: 'Recipe for chocolate chip cookies with ingredients: flour, sugar, butter, eggs, chocolate chips. Baking instructions and cooking time included. Perfect for beginners and experienced bakers alike.'
        }
    ];

    return (
        <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
                <Toast
                    message={toastMessage}
                    type={toastType}
                    show={showToast}
                    onHide={() => setShowToast(false)}
                />

                <div className="p-6 max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Tagging Demo</h1>
                        <p className="text-gray-600">
                            Test the AI-powered auto-tagging functionality with sample text or your own content.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Input Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test AI Tagging</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sample Texts
                                    </label>
                                    <div className="space-y-2">
                                        {sampleTexts.map((sample, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setSampleText(sample.text)}
                                                className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="font-medium text-sm text-gray-900">{sample.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{sample.text}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Or enter your own text
                                    </label>
                                    <textarea
                                        value={sampleText}
                                        onChange={(e) => setSampleText(e.target.value)}
                                        placeholder="Enter text content to test AI tagging..."
                                        className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleTestAITagging}
                                    disabled={isLoading || !sampleText.trim()}
                                    className={`
                                        w-full px-4 py-2 rounded-md text-sm font-medium text-white 
                                        ${isLoading || !sampleText.trim()
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }
                                    `}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating AI Tags...
                                        </span>
                                    ) : (
                                        'Generate AI Tags'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Generated Tags</h2>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                </div>
                            )}

                            {aiTags.length > 0 && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">AI Generated Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {aiTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p><strong>Total tags:</strong> {aiTags.length}</p>
                                        <p><strong>Tag format:</strong> lowercase, hyphenated</p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && !error && aiTags.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 713 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <p>No tags generated yet. Enter some text and click &quot;Generate AI Tags&quot; to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">How AI Tagging Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-medium mb-2">Process:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Text content is analyzed by AI</li>
                                    <li>Relevant keywords are identified</li>
                                    <li>Tags are generated and formatted</li>
                                    <li>Results are returned as clickable tags</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Features:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Automatic tag generation</li>
                                    <li>Consistent formatting (lowercase, hyphens)</li>
                                    <li>Relevant and descriptive tags</li>
                                    <li>Easy integration with file uploads</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
