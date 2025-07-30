
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileList from '@/component/File/FileList';
import Search from '@/component/Search/Search';
import Link from 'next/link';

export default function Home() {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {isSearchMode ? 'Search Files' : 'Your Files'}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsSearchMode(!isSearchMode)}
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            {isSearchMode ? 'Show All Files' : 'Search Files'}
          </button>
          <Link
            href="/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Files
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isSearchMode ? (
          <Search />
        ) : (
          <FileList />
        )}
      </div>
    </div>
  );
}
