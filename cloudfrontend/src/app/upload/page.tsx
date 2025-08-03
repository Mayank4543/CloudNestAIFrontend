'use client';

import React from 'react';
import UploadForm from '@/component/Upload/UploadForm';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';

export default function UploadPage() {
    return (
        <DashboardLayout>
            <div className="p-6">
                <UploadForm />
            </div>
        </DashboardLayout>
    );
}
