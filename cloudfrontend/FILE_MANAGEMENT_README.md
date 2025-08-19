# CloudNest AI - Google Drive-Like File Management System

## Overview

CloudNest AI Frontend is a modern file management system built with Next.js, TypeScript, and Tailwind CSS. It provides a Google Drive-like interface for file upload, organization, and management with features like owner information, location tracking, and secure file access.

## Features

### 🗂️ File Management

- **Google Drive-like Interface**: Clean, intuitive design similar to Google Drive
- **Multiple View Modes**: Switch between list and grid views
- **Owner Information**: Display file owner details with avatar and email
- **Location Tracking**: Show file storage location and access permissions
- **File Types**: Support for documents, images, videos, audio, and archives
- **Tags System**: Organize files with custom tags
- **Search & Filter**: Search files by name and tags
- **Sort Options**: Sort by name, date, or size (ascending/descending)

### 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route protection for authenticated users
- **File Permissions**: Public/private file access control
- **Owner Verification**: Files accessible only by owners unless public

### 📱 User Experience

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: File operations reflect immediately
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error notifications
- **Drag & Drop**: Easy file upload with drag and drop

## API Integration

### File Operations

```typescript
// Get all files with pagination
const files = await api.files.getAll({ page: 1, limit: 10 });

// Upload file
const formData = new FormData();
formData.append("file", file);
const response = await api.files.upload(formData);

// Download file
const downloadUrl = api.files.download(fileId);

// Delete file
await api.files.delete(fileId);
```

### Authentication

```typescript
// Login
const response = await api.auth.login({ email, password });

// Register
const response = await api.auth.register({ name, email, password });

// Get profile
const profile = await api.auth.getProfile();
```

## File Structure

```
src/
├── app/
│   ├── dashboard/           # Main dashboard page
│   ├── upload/             # File upload page
│   ├── auth/               # Authentication pages
│   └── insights/           # File insights and analytics
├── component/
│   ├── Dashboard/
│   │   ├── Files/          # File-related components
│   │   │   ├── FileCard.tsx        # File card components
│   │   │   ├── DashboardFileCard.tsx
│   │   │   └── DashboardFileList.tsx
│   │   └── Layout/         # Dashboard layout components
│   ├── Upload/
│   │   └── UploadForm.tsx  # File upload form
│   ├── Auth/               # Authentication components
│   └── common/             # Shared components
└── utils/
    └── api.ts              # API client and utilities
```

## Key Components

### Dashboard (`/app/dashboard/page.tsx`)

- Main file management interface
- List/Grid view toggle
- Search and sorting functionality
- File operations (download, delete)
- Owner and location information display
- Storage usage summary

### Upload Form (`/component/Upload/UploadForm.tsx`)

- Drag and drop file upload
- Multiple file selection
- Tag management
- Upload progress indication
- Authentication verification

### File Card (`/component/Dashboard/Files/FileCard.tsx`)

- File information display
- Owner avatar and details
- Location and permission status
- File type icons
- Action buttons (download, delete)

### API Client (`/utils/api.ts`)

- Axios-based HTTP client
- Authentication interceptors
- Error handling
- Helper utilities for file operations

## Environment Configuration

Required environment variables in `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=your_backend_url

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=CloudNest AI
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

## Usage Examples

### Basic File Upload

```tsx
const handleFileUpload = async (files: FileList) => {
  const formData = new FormData();
  formData.append("file", files[0]);

  // Add tags if needed
  const tags = ["document", "important"];
  formData.append("tags", JSON.stringify(tags));

  try {
    const response = await api.files.upload(formData);
    console.log("File uploaded:", response.data);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### File Management Operations

```tsx
const handleFileDelete = async (fileId: string, fileName: string) => {
  if (window.confirm(`Delete "${fileName}"?`)) {
    try {
      await api.files.delete(fileId);
      // Update local state to remove file
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }
};

const handleFileDownload = (fileId: string, fileName: string) => {
  const downloadUrl = api.files.download(fileId);
  window.open(downloadUrl, "_blank");
};
```

## Data Models

### File Data Structure

```typescript
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
  owner?: {
    name: string;
    email: string;
  };
}
```

### API Response Structure

```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  data: FileData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalFiles: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}
```

## Features Implementation

### Owner Display

- Shows file owner avatar (first letter of name)
- Displays owner name and email
- Defaults to "Me" for current user's files

### Location Information

- Extracts meaningful path from file storage location
- Shows access permissions (Public/Private)
- Displays "Accessible to anyone" or "Only you" status

### File Type Recognition

- Automatic file type detection from MIME type
- Appropriate icons for different file types
- Support for images, documents, videos, audio, archives

### Search and Filter

- Real-time search as you type
- Search by filename and tags
- Filter by file properties
- Sort by multiple criteria

## Security Considerations

### Authentication

- JWT tokens stored in localStorage/sessionStorage
- Automatic token refresh on API calls
- Redirect to login on authentication failure

### File Access

- Owner-based access control
- Public/private file permissions
- Secure file download URLs

### Error Handling

- Comprehensive error handling for API calls
- User-friendly error messages
- Network error recovery

## Performance Features

### Optimization

- Lazy loading for large file lists
- Pagination for file listing
- Efficient re-rendering with React keys
- Debounced search input

### Caching

- API response caching
- Local state management
- Optimistic updates for better UX

## Future Enhancements

### Planned Features

- [ ] Folder organization
- [ ] File sharing with links
- [ ] Bulk file operations
- [ ] File version history
- [ ] Advanced search filters
- [ ] File preview functionality
- [ ] Collaborative features
- [ ] Integration with cloud storage providers

### Technical Improvements

- [ ] Service Worker for offline support
- [ ] Progressive Web App features
- [ ] Advanced caching strategies
- [ ] File upload chunking
- [ ] Background sync

This implementation provides a solid foundation for a Google Drive-like file management system with proper owner tracking, location information, and modern UI/UX patterns.
