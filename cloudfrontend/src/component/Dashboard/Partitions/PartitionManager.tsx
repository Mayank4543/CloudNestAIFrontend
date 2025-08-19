'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import {
  IStoragePartition,
  PartitionWithStats,
  getPartitionStatus
} from '@/types/partitions';

interface PartitionManagerProps {
  onPartitionCreated?: (partition: IStoragePartition) => void;
  onPartitionUpdated?: (partition: IStoragePartition) => void;
  onPartitionDeleted?: (partitionId: string) => void;
}

const PartitionManager: React.FC<PartitionManagerProps> = ({
  onPartitionCreated,
  onPartitionUpdated,
  onPartitionDeleted
}) => {
  const [partitions, setPartitions] = useState<PartitionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPartition, setEditingPartition] = useState<IStoragePartition | null>(null);
  const [editQuotaValue, setEditQuotaValue] = useState<string>('');

  // Form states
  const [newPartitionName, setNewPartitionName] = useState('');
  const [newPartitionQuota, setNewPartitionQuota] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPartitions();
  }, []);

  const fetchPartitions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.partitions.getUsage();
      if (response.data.success) {
        // Transform backend data to ensure percentageUsed is in percentage format
        const transformedPartitions: PartitionWithStats[] = response.data.data.partitions.map((partition: PartitionWithStats) => ({
          ...partition,
          _id: partition._id || `partition-${partition.name}`,
          stats: {
            ...partition.stats,
            percentageUsed: partition.stats.percentageUsed * 100 // Convert decimal to percentage
          }
        }));
        setPartitions(transformedPartitions);
      } else {
        setError('Failed to load partitions');
      }
    } catch (err) {
      console.error('Error fetching partitions:', err);
      setError('Failed to load partitions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartition = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      // Validate form
      if (!newPartitionName.trim()) {
        setFormError('Partition name is required');
        return;
      }

      if (!newPartitionQuota || parseFloat(newPartitionQuota) <= 0) {
        setFormError('Valid quota is required');
        return;
      }

      // Check for duplicate names
      if (partitions.some(p => p.name.toLowerCase() === newPartitionName.toLowerCase())) {
        setFormError('A partition with this name already exists');
        return;
      }

      // Convert quota to bytes (assuming input is in GB)
      const quotaInBytes = parseFloat(newPartitionQuota) * 1024 * 1024 * 1024;

      const response = await api.partitions.create({
        name: newPartitionName.toLowerCase().replace(/\s+/g, '-'),
        quota: quotaInBytes
      });

      if (response.data.success) {
        setNewPartitionName('');
        setNewPartitionQuota('');
        setShowCreateForm(false);
        await fetchPartitions(); // Refresh the list
        onPartitionCreated?.(response.data.data as IStoragePartition);

        // Trigger event for other components to refresh
        localStorage.setItem('partitionUpdated', Date.now().toString());
        localStorage.removeItem('partitionUpdated');
      } else {
        setFormError(response.data.message || 'Failed to create partition');
      }
    } catch (err: unknown) {
      console.error('Error creating partition:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to create partition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePartition = async (partition: IStoragePartition, newQuota: number) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await api.partitions.update(partition.name, { quota: newQuota });

      if (response.data.success) {
        await fetchPartitions();
        setEditingPartition(null);
        setEditQuotaValue('');
        onPartitionUpdated?.(response.data.data as IStoragePartition);

        // Trigger event for other components to refresh
        localStorage.setItem('partitionUpdated', Date.now().toString());
        localStorage.removeItem('partitionUpdated');
      } else {
        setError(response.data.message || 'Failed to update partition');
      }
    } catch (err: unknown) {
      console.error('Error updating partition:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update partition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePartition = async (partition: IStoragePartition) => {
    if (!confirm(`Are you sure you want to delete the "${partition.name}" partition? This action cannot be undone.`)) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.partitions.delete(partition.name);

      if (response.data.success) {
        await fetchPartitions();
        onPartitionDeleted?.(partition.name);

        // Trigger event for other components to refresh
        localStorage.setItem('partitionUpdated', Date.now().toString());
        localStorage.removeItem('partitionUpdated');
      } else {
        setError(response.data.message || 'Failed to delete partition');
      }
    } catch (err: unknown) {
      console.error('Error deleting partition:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete partition');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      healthy: { bg: 'bg-green-100', text: 'text-green-800', label: 'Healthy' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Warning' },
      danger: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Danger' },
      full: { bg: 'bg-red-100', text: 'text-red-800', label: 'Full' }
    };

    const config = configs[status as keyof typeof configs] || configs.healthy;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPartitionIcon = (partitionName: string) => {
    switch (partitionName.toLowerCase()) {
      case 'personal':
        return <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
      case 'work':
        return <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-1a1 1 0 00-1 1v1h2V6a1 1 0 00-1-1zm0 2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" /></svg>;
      default:
        return <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          Storage Partitions
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Partition
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Partition Form */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Partition</h3>

          <form onSubmit={handleCreatePartition} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partition Name
              </label>
              <input
                type="text"
                value={newPartitionName}
                onChange={(e) => setNewPartitionName(e.target.value)}
                placeholder="e.g., projects, documents, media"
                className="block w-full px-3 py-2 text-black border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#18b26f] focus:border-[#18b26f]"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Quota (GB)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newPartitionQuota}
                onChange={(e) => setNewPartitionQuota(e.target.value)}
                placeholder="e.g., 5.0"
                className="block w-full px-3 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#18b26f] focus:border-[#18b26f]"
                disabled={submitting}
              />
            </div>

            {formError && (
              <div className="text-red-600 text-sm">{formError}</div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Partition'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormError(null);
                  setNewPartitionName('');
                  setNewPartitionQuota('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Partitions List */}
      <div className="space-y-4">
        {partitions.map((partition) => {
          const status = getPartitionStatus(partition.stats.percentageUsed);
          const isEditing = editingPartition?._id === partition._id;

          return (
            <div key={partition._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getPartitionIcon(partition.name)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {partition.name}
                      </h3>
                      {getStatusBadge(status)}
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {partition.stats.formattedUsed} of {partition.stats.formattedQuota} used
                      • {partition.stats.totalFiles} files
                    </div>

                    {/* Usage Bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${status === 'full' ? 'bg-red-500' :
                          status === 'danger' ? 'bg-orange-500' :
                            status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(partition.stats.percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setEditingPartition(null);
                        setEditQuotaValue('');
                      } else {
                        setEditingPartition(partition);
                        setEditQuotaValue((partition.quota / (1024 * 1024 * 1024)).toFixed(1));
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit quota"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete Button (only for non-default partitions) */}
                  {!['personal', 'work'].includes(partition.name) && (
                    <button
                      onClick={() => handleDeletePartition(partition)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete partition"
                      disabled={submitting}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">
                      New Quota (GB):
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={editQuotaValue}
                      onChange={(e) => setEditQuotaValue(e.target.value)}
                      className="px-3 py-1 border text-black border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#18b26f] focus:border-[#18b26f]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const newQuota = parseFloat(editQuotaValue) * 1024 * 1024 * 1024;
                          if (!isNaN(newQuota) && newQuota > 0) {
                            handleUpdatePartition(partition, newQuota);
                          }
                        } else if (e.key === 'Escape') {
                          setEditingPartition(null);
                          setEditQuotaValue('');
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        const newQuota = parseFloat(editQuotaValue) * 1024 * 1024 * 1024;
                        if (!isNaN(newQuota) && newQuota > 0) {
                          handleUpdatePartition(partition, newQuota);
                        } else {
                          setError('Please enter a valid quota value');
                        }
                      }}
                      className="px-3 py-1 bg-[#18b26f] text-black text-sm rounded hover:bg-[#149d5f] transition-colors disabled:opacity-50"
                      disabled={submitting || !editQuotaValue || parseFloat(editQuotaValue) <= 0}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingPartition(null);
                        setEditQuotaValue('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {partitions.length === 0 && !loading && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No partitions found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first storage partition.</p>
        </div>
      )}
    </div>
  );
};

export default PartitionManager;
