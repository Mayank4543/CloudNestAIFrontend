import React, { useState, useCallback, useEffect } from 'react';
import { api } from '../../utils/api';
import FileCardListView from '../Dashboard/Files/FileCard';
import AdvancedSearchForm, { SearchFilters } from './AdvancedSearchForm';

interface FileData {
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
}

interface SearchResponse {
    success: boolean;
    message: string;
    data: FileData[];
}

const Search: React.FC = () => {
    const [searchResults, setSearchResults] = useState<FileData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        tags: [],
        mimetype: ''
    });
    const [resultsCount, setResultsCount] = useState<number>(0);

    // Initialize from URL parameters if available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const query = searchParams.get('q') || '';
            const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : [];
            const mimetype = searchParams.get('mimetype') || '';

            if (query || tags.length > 0 || mimetype) {
                setFilters({ query, tags, mimetype });
                searchFiles({ query, tags, mimetype });
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update URL with search parameters
    const updateUrlWithFilters = (newFilters: SearchFilters) => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams();

            if (newFilters.query) {
                searchParams.set('q', newFilters.query);
            }

            if (newFilters.tags && newFilters.tags.length > 0) {
                searchParams.set('tags', newFilters.tags.join(','));
            }

            if (newFilters.mimetype) {
                searchParams.set('mimetype', newFilters.mimetype);
            }

            const newUrl =
                window.location.pathname +
                (searchParams.toString() ? `?${searchParams.toString()}` : '');

            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    };

    // Handle file deletion
    const handleFileDelete = (fileId: string) => {
        setSearchResults(prevResults => prevResults.filter(file => file._id !== fileId));
        setResultsCount(prev => prev - 1);
    };

    // Search for files with the given filters
    const searchFiles = useCallback(async (searchFilters: SearchFilters) => {
        // Don't search if no filters are provided
        if (!searchFilters.query && searchFilters.tags.length === 0 && !searchFilters.mimetype) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setHasSearched(true);
            setFilters(searchFilters);

            // Update URL with current filters
            updateUrlWithFilters(searchFilters);

            const response = await api.files.search({
                q: searchFilters.query,
                tags: searchFilters.tags,
                mimetype: searchFilters.mimetype
            });

            // Type assertion for the response data
            const responseData = response.data as SearchResponse;

            if (responseData.success) {
                setSearchResults(responseData.data);
                setResultsCount(responseData.data.length);
            } else {
                setError(responseData.message || 'Failed to search files');
                setSearchResults([]);
                setResultsCount(0);
            }
        } catch (err) {
            console.error('Error searching files:', err);
            setError('An error occurred while searching. Please try again.');
            setSearchResults([]);
            setResultsCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle search submission
    const handleSearch = (searchFilters: SearchFilters) => {
        searchFiles(searchFilters);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-black mb-6">Search Files</h1>

            {/* Advanced Search Form */}
            <div className="mb-8 max-w-4xl mx-auto">
                <AdvancedSearchForm onSearch={handleSearch} initialFilters={filters} />
                <p className="text-sm text-gray-500 mt-2 text-center">
                    Search by keywords, tags, or file types. Use filters for more specific results.
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-500">Searching for files...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 max-w-3xl mx-auto shadow-sm">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Empty Results */}
            {hasSearched && !loading && !error && searchResults.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-gray-500 text-lg">No files found matching your criteria</p>
                    <div className="mt-3 text-sm text-gray-500">
                        {filters.query && <p>Query: <span className="font-semibold">{filters.query}</span></p>}
                        {filters.tags.length > 0 && <p>Tags: <span className="font-semibold">{filters.tags.join(', ')}</span></p>}
                        {filters.mimetype && <p>Type: <span className="font-semibold">{filters.mimetype}</span></p>}
                    </div>
                    <button
                        onClick={() => handleSearch({ query: '', tags: [], mimetype: '' })}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Clear filters
                    </button>
                </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
                <div className="mt-8">
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-800">
                                    Search Results <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded ml-2">{resultsCount}</span>
                                </h2>
                                <div className="text-sm text-gray-500">
                                    Showing {searchResults.length} {searchResults.length === 1 ? 'file' : 'files'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                            {searchResults.map((file) => (
                                <FileCardListView
                                    key={file._id}
                                    file={file}
                                    onDownload={(fileId, fileName) => {
                                        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'https://cloudnestaibackend.onrender.com'}/api/files/download/${fileId}`, '_blank');
                                       
                                    }}
                                    onDelete={(fileId) => {
                                        handleFileDelete(fileId);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
