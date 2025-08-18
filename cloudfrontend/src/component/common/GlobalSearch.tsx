'use client';

import React, { useState, useRef, useCallback } from 'react';
import { api } from '../../utils/api';

// Types
interface SearchResult {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    userId: string;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    url?: string;
    owner?: {
        name: string;
        email: string;
    };
    relevanceScore?: number; // For AI search results
}

interface SemanticSearchResult {
    fileId: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    userId: string;
    url: string;
    relevanceScore: number;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    r2Url?: string;
    owner?: {
        name: string;
        email: string;
    };
}

type SearchType = 'keyword' | 'semantic';

interface GlobalSearchProps {
    onSearchResults?: (results: SearchResult[], searchType: SearchType) => void;
    onClearSearch?: () => void; // Add callback for clearing search
    placeholder?: string;
    className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
    onSearchResults,
    onClearSearch,
    placeholder = "Search files...",
    className = ""
}) => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('keyword');
    const [includePublic, setIncludePublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search requests
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Perform the actual search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            setError(null);

            if (searchType === 'keyword') {
                // Keyword search
                const response = await api.files.search({
                    q: searchQuery,
                    tags: [],
                    mimetype: ''
                });

                if (response.data.success) {
                    const results = response.data.data;
                    if (onSearchResults) {
                        onSearchResults(results, 'keyword');
                    }
                } else {
                    setError(response.data.message || 'Search failed');
                    if (onSearchResults) {
                        onSearchResults([], 'keyword');
                    }
                }
            } else {
                // Semantic search
                const response = await api.files.semanticSearch({
                    q: searchQuery,
                    includePublic,
                    limit: 50
                });

                if (response.data.success) {
                    // Convert semantic search results to match our SearchResult interface
                    const convertedResults: SearchResult[] = response.data.data.map((item: SemanticSearchResult) => ({
                        _id: item.fileId,
                        filename: item.filename,
                        originalname: item.originalname,
                        mimetype: item.mimetype,
                        size: item.size,
                        path: item.path,
                        userId: item.userId,
                        isPublic: item.isPublic,
                        tags: item.tags,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        url: item.url,
                        relevanceScore: item.relevanceScore,
                        owner: item.owner
                    }));

                    if (onSearchResults) {
                        onSearchResults(convertedResults, 'semantic');
                    }
                } else {
                    setError(response.data.message || 'Semantic search failed');
                    if (onSearchResults) {
                        onSearchResults([], 'semantic');
                    }
                }
            }
        } catch (err: unknown) {
            console.error('Search error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
            setError(errorMessage);
            if (onSearchResults) {
                onSearchResults([], searchType);
            }
        } finally {
            setLoading(false);
        }
    }, [searchType, includePublic, onSearchResults]);

    // Debounced search function
    const debouncedSearch = useCallback((searchQuery: string) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                // Clear results when search is empty
                if (onSearchResults) {
                    onSearchResults([], searchType);
                }
            }
        }, 500);
    }, [searchType, onSearchResults, performSearch]);

    // Handle input change
    const handleInputChange = (value: string) => {
        setQuery(value);
        if (value.trim()) {
            debouncedSearch(value);
        } else {
            // Clear results when input is empty
            if (onSearchResults) {
                onSearchResults([], searchType);
            }
        }
    };



    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            performSearch(query);
        }
    };

    // Clear search
    const clearSearch = () => {
        setQuery('');
        setError(null);
        if (onSearchResults) {
            onSearchResults([], searchType);
        }
        if (onClearSearch) {
            onClearSearch();
        }
    };

    return (
        <div className={`relative flex-1 max-w-2xl ${className}`}>
            <form onSubmit={handleSearch} className="relative">
                {/* Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#18b26f]"></div>
                        ) : (
                            <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={placeholder}
                        className="block w-full text-black pl-10 pr-20 sm:pr-32 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#18b26f] focus:ring-1 focus:ring-[#18b26f] text-xs sm:text-sm transition-all duration-150"
                    />

                    {/* Search Type Toggle */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Segmented Control */}
                            <div className="flex bg-gray-100 rounded-full p-0.5 sm:p-1">
                                <button
                                    type="button"
                                    onClick={() => setSearchType('keyword')}
                                    className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full transition-all duration-200 ${searchType === 'keyword'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="hidden sm:inline">Keyword</span>
                                    <span className="sm:hidden">Key</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType('semantic')}
                                    className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full transition-all duration-200 ${searchType === 'semantic'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="hidden sm:inline">AI</span>
                                    <span className="sm:hidden">AI</span>
                                </button>
                            </div>

                            {/* Include Public Toggle */}
                            <button
                                type="button"
                                onClick={() => setIncludePublic(!includePublic)}
                                className={`p-1 sm:p-1.5 rounded-full transition-all duration-200 ${includePublic
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                                    }`}
                                title={includePublic ? 'Include public files' : 'Exclude public files'}
                            >
                                <span className="text-xs sm:text-sm">🌐</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Error Display */}
            {error && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-2 z-10">
                    <p className="text-xs text-red-600 text-center">{error}</p>
                </div>
            )}

            {/* Clear Search Button */}
            {query && (
                <button
                    onClick={clearSearch}
                    className="absolute top-1/2 right-20 sm:right-36 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default GlobalSearch;
