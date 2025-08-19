'use client';

import React from 'react';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import PartitionManager from '@/component/Dashboard/Partitions/PartitionManager';
import ProtectedRoute from '@/component/common/ProtectedRoute';

function PartitionsContent() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Storage Partitions</h1>
            <p className="mt-2 text-gray-600">
              Organize your files into separate storage partitions with individual quotas.
              Think of them as separate drives for different purposes.
            </p>
          </div>

          <PartitionManager />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PartitionsPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <PartitionsContent />
    </ProtectedRoute>
  );
}
