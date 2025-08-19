// Partition-related TypeScript interfaces

export interface IStoragePartition {
  _id?: string;
  name: string;
  quota: number; // in bytes
  used: number;  // in bytes
  createdAt?: string;
  updatedAt?: string;
}

export interface PartitionUsageStats {
  totalFiles: number;
  percentageUsed: number;
  formattedUsed: string;
  formattedQuota: string;
  isNearLimit: boolean; // when usage > 80%
  isOverLimit: boolean; // when usage > 100%
}

export interface PartitionWithStats extends IStoragePartition {
  stats: PartitionUsageStats;
}

export interface PartitionApiResponse {
  success: boolean;
  message: string;
  data: IStoragePartition[] | IStoragePartition;
}

export interface PartitionUsageResponse {
  success: boolean;
  message: string;
  data: {
    partitions: PartitionWithStats[];
    totalUsed: number;
    totalQuota: number;
    totalFiles: number;
  };
}

export interface MoveFilesRequest {
  fileIds: string[];
  fromPartition: string;
  toPartition: string;
}

export interface MoveFilesResponse {
  success: boolean;
  message: string;
  data: {
    movedFiles: number;
    updatedUsage: {
      [partitionName: string]: {
        used: number;
        quota: number;
      };
    };
  };
}

// File interface extended with partition information
export interface FileWithPartition {
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
  partition: string; // The partition this file belongs to
  owner?: {
    name: string;
    email: string;
  };
  relevanceScore?: number;
  starred?: boolean;
}

// Quota warning levels
export const QUOTA_WARNING_LEVELS = {
  WARNING: 0.8,  // 80% - show warning
  DANGER: 0.95,  // 95% - show danger
  FULL: 1.0      // 100% - quota exceeded
} as const;

// Default partition configurations
export const DEFAULT_PARTITIONS = {
  PERSONAL: {
    name: 'personal',
    quota: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    displayName: 'Personal'
  },
  WORK: {
    name: 'work',
    quota: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    displayName: 'Work'
  }
} as const;

// Utility functions for partitions
export const formatPartitionSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

export const getPartitionColor = (percentageUsed: number): string => {
  if (percentageUsed >= QUOTA_WARNING_LEVELS.FULL) return 'red';
  if (percentageUsed >= QUOTA_WARNING_LEVELS.DANGER) return 'orange';
  if (percentageUsed >= QUOTA_WARNING_LEVELS.WARNING) return 'yellow';
  return 'green';
};

export const getPartitionStatus = (percentageUsed: number): 'healthy' | 'warning' | 'danger' | 'full' => {
  if (percentageUsed >= QUOTA_WARNING_LEVELS.FULL) return 'full';
  if (percentageUsed >= QUOTA_WARNING_LEVELS.DANGER) return 'danger';
  if (percentageUsed >= QUOTA_WARNING_LEVELS.WARNING) return 'warning';
  return 'healthy';
};
