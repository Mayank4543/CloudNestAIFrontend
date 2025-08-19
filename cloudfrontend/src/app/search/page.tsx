
"use client"
import React, { useState } from 'react';
import AdvancedSearchForm, { SearchFilters } from '../../component/Search/AdvancedSearchForm';
import SemanticSearch from '../../component/Search/SemanticSearch';
import SemanticSearchResults from '../../component/Search/SemanticSearchResults';
import FileCardListView from '../../component/Dashboard/Files/FileCard';
import { api } from '../../utils/api';

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
}

interface SearchResult {
  fileId: string;
  filename: string;
  originalname: string;
  url: string;
  relevanceScore: number;
  isPublic: boolean;
  tags: string[];
}

export default function EnhancedSearch() {
  const [activeTab, setActiveTab] = useState<'keyword' | 'semantic'>('keyword');
  const [keywordResults, setKeywordResults] = useState<FileData[]>([]);
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleKeywordSearch = async (filters: SearchFilters) => {
    if (!filters.query && filters.tags.length === 0 && !filters.mimetype) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(filters.query);

      const response = await api.files.search({
        q: filters.query,
        tags: filters.tags,
        mimetype: filters.mimetype
      });

      if (response.data.success) {
        setKeywordResults(response.data.data);
      } else {
        setError(response.data.message || 'Failed to search files');
      }
    } catch (err: unknown) {
      console.error('Error searching files:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticResults = (results: SearchResult[]) => {
    setSemanticResults(results);
  };

  const handleFileDelete = (fileId: string) => {
    setKeywordResults(prevResults => prevResults.filter(file => file._id !== fileId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Your Files</h1>

      {/* Search Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('keyword')}
            className={`${activeTab === 'keyword'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Keyword Search
          </button>
          <button
            onClick={() => setActiveTab('semantic')}
            className={`${activeTab === 'semantic'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Semantic Search
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              AI-Powered
            </span>
          </button>
        </nav>
      </div>

      {/* Search Content */}
      <div className="max-w-4xl mx-auto">
        {/* Keyword Search Tab */}
        {activeTab === 'keyword' && (
          <div>
            <AdvancedSearchForm onSearch={handleKeywordSearch} initialFilters={{ query: searchQuery, tags: [], mimetype: '' }} />
            <p className="text-sm text-gray-500 mt-2 text-center mb-8">
              Search by exact keywords, tags, or file types. Use filters for more specific results.
            </p>

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

            {/* Results */}
            {!loading && keywordResults.length > 0 && (
              <div className="mt-8">
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-800">
                        Search Results <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded ml-2">{keywordResults.length}</span>
                      </h2>
                      <div className="text-sm text-gray-500">
                        Showing {keywordResults.length} {keywordResults.length === 1 ? 'file' : 'files'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {keywordResults.map((file) => (
                      <FileCardListView
                        key={file._id}
                        file={file}
                        onDownload={(fileId) => {
                          window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL }/api/files/download/${fileId}`, '_blank');
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
        )}

        {/* Semantic Search Tab */}
        {activeTab === 'semantic' && (
          <div>
            <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Semantic Search
                </h3>
                <p className="text-sm text-gray-600">
                  Use natural language to describe what you&apos;re looking for. Our AI will analyze the content of your files and find the most relevant matches.
                </p>
              </div>

              <SemanticSearch initialQuery={searchQuery} onResultsFound={handleSemanticResults} />
            </div>

            <SemanticSearchResults
              results={semanticResults}
              query={searchQuery}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
