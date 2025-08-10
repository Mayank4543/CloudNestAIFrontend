import React, { useState, useCallback } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import FileCardListView from '../Dashboard/Files/FileCard';

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
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Debounce the search to avoid too many API calls
    const debounce = <T extends (...args: string[]) => void>(func: T, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return function (...args: Parameters<T>) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    // Format date to a readable format (keeping for future use)
    const _formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Function to get file type from mimetype (keeping for future use)
    const _getFileType = (mimetype: string): string => {
        const parts = mimetype.split('/');
        if (parts.length > 1) {
            return parts[1].toUpperCase();
        }
        return parts[0].toUpperCase();
    };

    // Handle file deletion
    const handleFileDelete = (fileId: string) => {
        setSearchResults(prevResults => prevResults.filter(file => file._id !== fileId));
    };

    // Search for files with the given query
    const searchFiles = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setHasSearched(true);
            setSearchQuery(query);

            const response = await axios.get<SearchResponse>(
                `https://cloudnestaibackend.onrender.com/api/files/search?q=${encodeURIComponent(query)}`
            );

            if (response.data.success) {
                setSearchResults(response.data.data);
            } else {
                setError(response.data.message || 'Failed to search files');
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Error searching files:', err);
            setError('An error occurred while searching. Please try again.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback((query: string) => {
        const debouncedFn = debounce((searchQuery: string) => {
            searchFiles(searchQuery);
        }, 500);
        debouncedFn(query);
    }, [searchFiles]);

    // Handle search input
    const handleSearch = (searchTerm: string) => {
        debouncedSearch(searchTerm);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Search Files</h1>

            {/* Search Input */}
            <div className="mb-8">
                <SearchBar
                    placeholder="Search files by name, type, or tags..."
                    onSearch={handleSearch}
                    className="max-w-3xl mx-auto"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                    Enter keywords to search for files. Results will update as you type.
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-3xl mx-auto">
                    {error}
                </div>
            )}

            {/* Empty Results */}
            {hasSearched && !loading && !error && searchResults.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-gray-500 text-lg">No files found for &quot;{searchQuery}&quot;</p>
                    <p className="text-gray-400 text-sm mt-2">Try different keywords or check your spelling</p>
                </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
                <>
                    <div className="mb-4">
                        <h2 className="text-lg font-medium text-gray-700">
                            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchResults.map((file) => (
                            <FileCardListView
                                key={file._id}
                                file={file}
                                onDownload={(fileId, fileName) => {
                                    // Handle download logic
                                    console.log(`Downloading ${fileName}`);
                                }}
                                onDelete={handleFileDelete}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Search;
