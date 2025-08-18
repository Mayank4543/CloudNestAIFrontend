'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import TrashFileTable from '@/component/Dashboard/Files/TrashFileTable';

// Define proper types for our file objects (matching TrashFileTable expectations)
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
    deletedAt: string;
    url?: string;
    owner?: {
        name: string;
        email: string;
    };
}

interface TrashResponse {
    success: boolean;
    message: string;
    data: FileData[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function TrashPage() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchTrashFiles = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await axios.get<TrashResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cloudnestaibackend.onrender.com'}/api/files/trash`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Backend returns: { success: true, data: filesArray, pagination: {...} }
            // So we need to access response.data.data to get the actual files array
            setFiles(response.data.data || []);
        } catch (error) {
            console.error('Error fetching trash files:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchTrashFiles();
    }, [fetchTrashFiles]);

    const handleRestoreFile = async (fileId: string) => {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cloudnestaibackend.onrender.com'}/api/files/restore/${fileId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh the file list
            fetchTrashFiles();

            // Show success message
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded shadow-lg z-[100]`;
            toast.textContent = 'File restored successfully';
            document.body.appendChild(toast);

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);
        } catch (error) {
            console.error('Error restoring file:', error);

            // Show error message
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 bg-red-800 text-white px-6 py-3 rounded shadow-lg z-[100]`;
            toast.textContent = 'Error restoring file';
            document.body.appendChild(toast);

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);
        }
    };

    const handleDeletePermanently = async (fileId: string, fileName: string) => {
        // Ask for confirmation
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${fileName}"? This action cannot be undone.`);

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cloudnestaibackend.onrender.com'}/api/files/permanent/${fileId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh the file list
            fetchTrashFiles();

            // Show success message
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded shadow-lg z-[100]`;
            toast.textContent = 'File permanently deleted';
            document.body.appendChild(toast);

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);
        } catch (error) {
            console.error('Error deleting file permanently:', error);

            // Show error message
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 bg-red-800 text-white px-6 py-3 rounded shadow-lg z-[100]`;
            toast.textContent = 'Error deleting file';
            document.body.appendChild(toast);

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);
        }
    };

    const handleEmptyTrash = async () => {
        // Ask for confirmation
        const confirmEmpty = window.confirm('Are you sure you want to empty the trash? All files will be permanently deleted and cannot be recovered.');

        if (!confirmEmpty) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cloudnestaibackend.onrender.com'}/api/files/trash/empty`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh the file list
            fetchTrashFiles();

            // Show success message
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded shadow-lg z-[100]`;
            toast.textContent = 'Trash emptied successfully';
            document.body.appendChild(toast);

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);
        } catch (error) {
            console.error('Error emptying trash:', error);

            // Show error message
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 bg-red-800 text-white px-6 py-3 rounded shadow-lg z-[100]`;
            toast.textContent = 'Error emptying trash';
            document.body.appendChild(toast);

            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Trash</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Files in trash will be automatically deleted after 30 days
                        </p>
                    </div>
                    {files.length > 0 && (
                        <button
                            onClick={handleEmptyTrash}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                        >
                            Empty Trash
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto h-20 w-20 text-gray-400">
                            <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Trash is empty</h3>
                        <p className="mt-1 text-sm text-gray-500">No files in the trash.</p>
                    </div>
                ) : (
                    <TrashFileTable
                        files={files}
                        onRestore={handleRestoreFile}
                        onPermanentDelete={handleDeletePermanently}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
