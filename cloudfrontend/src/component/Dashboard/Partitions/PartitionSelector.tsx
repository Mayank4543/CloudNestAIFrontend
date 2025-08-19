'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { PartitionWithStats, formatPartitionSize, getPartitionStatus } from '@/types/partitions';

interface PartitionSelectorProps {
  selectedPartition: string;
  onPartitionChange: (partitionName: string) => void;
  disabled?: boolean;
  showUsage?: boolean;
  className?: string;
}

const PartitionSelector: React.FC<PartitionSelectorProps> = ({
  selectedPartition,
  onPartitionChange,
  disabled = false,
  showUsage = true,
  className = ''
}) => {
  const [partitions, setPartitions] = useState<PartitionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartitions();
  }, []);

  const fetchPartitions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.partitions.getUsage();
      if (response.data.success) {
        // Transform backend data to ensure percentageUsed is in percentage format (not decimal)
        const transformedPartitions = response.data.data.partitions.map((partition: PartitionWithStats) => ({
          ...partition,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'full':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'danger':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getPartitionIcon = (partitionName: string) => {
    switch (partitionName.toLowerCase()) {
      case 'personal':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'work':
        return (
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-1a1 1 0 00-1 1v1h2V6a1 1 0 00-1-1zm0 2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Storage Partition
      </label>
      <div className="relative">
        <select
          value={selectedPartition}
          onChange={(e) => onPartitionChange(e.target.value)}
          disabled={disabled}
          className="block w-full pl-10 pr-10 py-3 border text-black border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#18b26f] focus:border-[#18b26f] bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {partitions.map((partition) => (
            <option key={partition.name} value={partition.name}>
              {partition.name.charAt(0).toUpperCase() + partition.name.slice(1)}
              {showUsage && ` (${formatPartitionSize(partition.used)}/${formatPartitionSize(partition.quota)})`}
            </option>
          ))}
        </select>

        {/* Partition Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {getPartitionIcon(selectedPartition)}
        </div>

        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
          {partitions.find(p => p.name === selectedPartition) &&
            getStatusIcon(getPartitionStatus(
              partitions.find(p => p.name === selectedPartition)?.stats.percentageUsed || 0
            ))
          }
        </div>

        {/* Dropdown Arrow */}
        {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div> */}
      </div>

      {/* Usage Bar */}
      {showUsage && partitions.find(p => p.name === selectedPartition) && (
        <div className="mt-2">
          {(() => {
            const partition = partitions.find(p => p.name === selectedPartition)!;
            const status = getPartitionStatus(partition.stats.percentageUsed);
            const barColor = {
              healthy: 'bg-green-500',
              warning: 'bg-yellow-500',
              danger: 'bg-orange-500',
              full: 'bg-red-500'
            }[status];

            return (
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{formatPartitionSize(partition.used)} used</span>
                  <span>{formatPartitionSize(partition.quota)} total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(partition.stats.percentageUsed, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {partition.stats.totalFiles} files • {partition.stats.percentageUsed.toFixed(1)}% used
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PartitionSelector;
