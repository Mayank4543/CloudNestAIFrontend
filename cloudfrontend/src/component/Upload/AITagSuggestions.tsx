import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { isAxiosError } from 'axios';

interface AITagSuggestionsProps {
    file: File;
    onTagsSelected: (tags: string[]) => void;
    disabled?: boolean;
    autoGenerate?: boolean; // New prop to control auto-generation
}

const AITagSuggestions: React.FC<AITagSuggestionsProps> = ({
    file,
    onTagsSelected,
    disabled = false,
    autoGenerate = true
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(true); // Start expanded by default
    const [hasGenerated, setHasGenerated] = useState(false);

    // Extract text from file for AI tagging
    const extractTextFromFile = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    // Limit text to first 1500 characters for AI processing
                    const truncatedText = text.substring(0, 1500);
                    resolve(truncatedText);
                } catch {
                    reject(new Error('Failed to read file content'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));

            // Read as text for supported file types
            if (file.type.includes('text') ||
                file.type.includes('csv') ||
                file.name.endsWith('.txt') ||
                file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                // For other file types, we&apos;ll use a placeholder
                resolve(`File: ${file.name} (${file.type})`);
            }
        });
    };

    // Generate AI tags
    const generateAITags = async () => {
      

        if (disabled || isLoading) {
           
            return;
        }

        // COMPREHENSIVE AUTH CHECK
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

       

        if (!token) {
          
            setError('Please log in to use AI tagging feature.');
            return;
        }

        if (!userSession) {
           
            setError('Session expired. Please log in again.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const textContent = await extractTextFromFile(file);
           

            // Make the API call
            const response = await api.files.testAITagging({
                text: textContent,
                filename: file.name
            });

           

            if (response.data.success && response.data.data.aiTaggingResult.success) {
                const tags = response.data.data.aiTaggingResult.tags;
                setAiTags(tags);
                setHasGenerated(true);
                // Auto-select first 3 tags by default only if autoGenerate is true
                if (autoGenerate) {
                    setSelectedTags(tags.slice(0, 3));
                    onTagsSelected(tags.slice(0, 3));
                } else {
                    setSelectedTags([]);
                    onTagsSelected([]);
                }
                
            } else {
                const errorMsg = response.data.data.aiTaggingResult.error || 'Failed to generate AI tags';
               
                setError(errorMsg);
            }
        } catch (error: unknown) {
            console.error('❌ AI tagging request failed:', error);

            if (isAxiosError(error)) {
                if (error.response?.status === 401) {
                   
                    setError('Authentication failed. Please refresh the page and log in again.');

                    // Clear potentially invalid tokens
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    localStorage.removeItem('userSession');
                    sessionStorage.removeItem('userSession');
                } else if (error.response?.status === 403) {
                    
                    setError('Access denied. Please check your permissions.');
                } else {
                    const errorMessage = error.response?.data?.message || 'Failed to generate AI tags. Please try again.';
                   
                    setError(errorMessage);
                }
            } else {
                
                setError('Network error. Please check your connection and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle tag selection/deselection
    const toggleTag = (tag: string) => {
        const newSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(newSelectedTags);
        onTagsSelected(newSelectedTags);
    };

    // Auto-generate tags when file changes (only if autoGenerate is true)
    useEffect(() => {
        if (file && !disabled && autoGenerate) {
            generateAITags();
        } else if (file && !disabled && !autoGenerate) {
            // Reset states when autoGenerate is false
            setAiTags([]);
            setSelectedTags([]);
            setHasGenerated(false);
            onTagsSelected([]);
        }
    }, [file, autoGenerate]); // eslint-disable-line react-hooks/exhaustive-deps

    if (disabled) {
        return null;
    }

    return (
        <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-purple-900 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    AI Generated Tags
                </h4>
                <div className="flex items-center space-x-2">
                    {!autoGenerate && !hasGenerated && (
                        <button
                            type="button"
                            onClick={generateAITags}
                            disabled={isLoading}
                            className="inline-flex items-center px-3 py-1.5 border border-purple-300 shadow-sm text-xs font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                        >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Generate Tags
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        {isExpanded ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center text-purple-700 text-sm py-3 px-4 bg-purple-50 rounded-lg">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing your file and generating intelligent tags...
                </div>
            )}

            {error && (
                <div className="text-red-700 text-sm mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                    <button
                        type="button"
                        onClick={generateAITags}
                        className="mt-2 text-purple-600 hover:text-purple-800 underline text-xs font-medium"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {isExpanded && aiTags.length > 0 && (
                <div className="space-y-4">
                    <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded-lg">
                        🤖 AI has analyzed your file content and suggests these tags. Click to select/deselect:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {aiTags.map((tag, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`
                                    inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105
                                    ${selectedTags.includes(tag)
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                        : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                                    }
                                `}
                            >
                                {tag}
                                {selectedTags.includes(tag) && (
                                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-purple-600 bg-purple-50 p-2 rounded-lg">
                        <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Selected: {selectedTags.length} of {aiTags.length} tags
                        </span>
                        {selectedTags.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedTags([]);
                                    onTagsSelected([]);
                                }}
                                className="text-purple-600 hover:text-purple-800 underline font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isExpanded && aiTags.length === 0 && !isLoading && !error && (
                <div className="text-purple-600 text-sm py-3 px-4 bg-purple-50 rounded-lg text-center">
                    {!autoGenerate && !hasGenerated
                        ? (
                            <div className="flex flex-col items-center space-y-2">
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Click &apos;Generate Tags&apos; to get AI suggestions for your file</span>
                            </div>
                        )
                        : (
                            <div className="flex flex-col items-center space-y-2">
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>No AI tags generated. This file might not contain extractable text content.</span>
                            </div>
                        )
                    }
                </div>
            )}
        </div>
    );
};

export default AITagSuggestions;
