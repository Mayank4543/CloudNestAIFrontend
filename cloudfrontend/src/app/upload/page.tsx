'use client';

import React from 'react';
import UploadForm from '@/component/Upload/UploadForm';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';

export default function UploadPage() {
    return (
        <ProtectedRoute requireAuth={true}>
            <DashboardLayout>
                <div className="p-6">
                    <UploadForm />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
