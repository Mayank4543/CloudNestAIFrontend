'use client';

import React from 'react';
import UploadForm from '@/component/Upload/UploadForm';
import Link from 'next/link';

export default function UploadPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Upload Files</h1>
                <Link
                    href="/"
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                    Back to Files
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <UploadForm />
            </div>
        </div>
    );
}
