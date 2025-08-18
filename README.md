# 🌩️ CloudNest AI

[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**CloudNest AI** is an intelligent cloud storage platform that combines the simplicity of modern file management with the power of artificial intelligence. Built with Next.js and Node.js, it offers secure file storage, AI-powered search, document analysis, and Google Drive-like functionality.

## ✨ Features

### 🔐 **Authentication & Security**

- **Google OAuth Integration** - Seamless login with Google accounts
- **JWT Token Authentication** - Secure session management
- **Role-based Access Control** - Admin and user permissions
- **Protected Routes** - Secure file access and sharing

### 📁 **File Management**

- **Multi-format Support** - Upload PDFs, images, documents, CSVs, and more
- **Drag & Drop Interface** - Intuitive file uploading experience
- **File Preview** - Quick preview of documents and images
- **Google Drive-style Interface** - Familiar and user-friendly design
- **Trash/Recycle Bin** - Soft delete with 30-day auto-cleanup
- **File Organization** - Folder structure and file categorization

### 🤖 **AI-Powered Features**

- **Semantic Search** - Find files by content, not just names
- **Document Summarization** - AI-generated summaries of your documents
- **Text Extraction** - OCR for images and scanned documents
- **Content Analysis** - Intelligent file categorization and tagging
- **Smart Recommendations** - AI-suggested file organization

### 🔍 **Advanced Search**

- **Keyword Search** - Traditional file name and metadata search
- **AI Semantic Search** - Natural language content-based search
- **Filter Options** - Search by file type, date, size, and tags
- **Search History** - Quick access to previous searches

### 📊 **Analytics & Insights**

- **Storage Usage** - Visual breakdown of storage consumption
- **File Analytics** - Usage patterns and file statistics
- **Activity Dashboard** - Recent uploads, downloads, and actions
- **Performance Metrics** - Response times and system health

### 🌐 **Modern Tech Stack**

#### **Frontend**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client for API calls

#### **Backend**

- **Node.js & Express** - RESTful API server
- **TypeScript** - End-to-end type safety
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling

#### **AI & ML**

- **Transformers.js** - Client-side AI models
- **Xenova Transformers** - Embedding generation
- **Tesseract.js** - OCR text extraction
- **PDF-Parse** - Document content extraction

#### **Cloud Storage**

- **Cloudflare R2** - Object storage (S3-compatible)
- **AWS S3 SDK** - Cloud storage operations
- **Presigned URLs** - Secure file access

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **MongoDB** database
- **Cloudflare R2** account (or AWS S3)
- **Google OAuth** credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mayank4543/CloudNestAIFrontend.git
   cd CloudNestAIFrontend
   ```

2. **Install frontend dependencies**

   ```bash
   cd cloudfrontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../cloudnestbackend
   npm install
   ```

### Environment Setup

#### **Frontend (.env.local)**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

#### **Backend (.env)**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cloudnest

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudflare R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=your_r2_endpoint

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Running the Application

1. **Start the backend server**

   ```bash
   cd cloudnestbackend
   npm run dev
   ```

2. **Start the frontend application**

   ```bash
   cd cloudfrontend
   npm run dev
   ```

3. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 API Documentation

### **Authentication Endpoints**

```
POST /api/auth/google     # Google OAuth login
POST /api/auth/logout     # User logout
GET  /api/auth/profile    # Get user profile
```

### **File Management Endpoints**

```
GET    /api/files              # List user files
POST   /api/files/upload       # Upload new file
GET    /api/files/:id          # Get file details
PUT    /api/files/:id          # Update file metadata
DELETE /api/files/:id          # Move to trash (soft delete)
GET    /api/files/:id/download # Download file
```

### **Trash Management**

```
GET    /api/files/trash        # List trash files
PUT    /api/files/restore/:id  # Restore from trash
DELETE /api/files/permanent/:id # Permanent delete
DELETE /api/files/trash/empty  # Empty entire trash
```

### **Search Endpoints**

```
GET /api/search/keyword    # Keyword-based search
GET /api/search/semantic   # AI semantic search
```

### **AI Features**

```
POST /api/ai/summarize     # Generate document summary
POST /api/ai/analyze       # Analyze file content
```

## 🏗️ Project Structure

```
CloudNestAIFrontend/
├── cloudfrontend/          # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── component/     # React components
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── cloudnestbackend/       # Node.js Backend
│   ├── src/
│   │   ├── controller/    # API controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── docs/              # Documentation
│   └── package.json
│
└── README.md
```

## 🔧 Available Scripts

### **Frontend Scripts**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### **Backend Scripts**

```bash
npm run dev      # Start development server with ts-node
npm run build    # Compile TypeScript to JavaScript
npm run start    # Start production server
npm test         # Run Jest tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## 🧪 Testing

The backend includes comprehensive test coverage:

```bash
cd cloudnestbackend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## 🚢 Deployment

### **Frontend (Vercel)**

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Backend (Render/Railway)**

1. Connect repository to your hosting platform
2. Set environment variables
3. Configure build and start commands:
   - Build: `npm run build`
   - Start: `npm start`

### **Database (MongoDB Atlas)**

1. Create MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` environment variable

## 🤝 Contributing

**This is a proprietary project with All Rights Reserved.**

Contributions are **not currently open to the public**. This codebase is for:

- **Educational purposes** - You may review the code structure and implementation
- **Personal learning** - You may study the architecture and design patterns
- **Portfolio review** - You may examine the project for assessment purposes

**For collaboration opportunities or employment inquiries, please contact:**

- Email: mayank.cloudnest@gmail.com
- GitHub: [@Mayank4543](https://github.com/Mayank4543)

Any unauthorized modifications, distributions, or derivative works are strictly prohibited.

## 📄 License

**All Rights Reserved**

This project and all associated code, documentation, and assets are the proprietary and confidential property of Mayank Rathore.

**⚠️ IMPORTANT NOTICE:**

- **No copying, distribution, or modification** is permitted without explicit written permission
- **No commercial use** is allowed without proper licensing agreement
- **No public hosting or deployment** is permitted without authorization
- This software is **not open source** and is protected by copyright law

For licensing inquiries or permissions, please contact: mayank.cloudnest@gmail.com

See the [LICENSE](LICENSE) file for complete terms and conditions.

## 👨‍💻 Authors

- **Mayank** - _Full Stack Developer_ - [@Mayank4543](https://github.com/Mayank4543)

## 🙏 Acknowledgments

- **OpenAI** for AI model inspiration
- **Google** for OAuth integration
- **Cloudflare** for R2 storage solution
- **Vercel** for Next.js framework
- **MongoDB** for database solutions

## 📞 Support

For support, email [support@cloudnest.ai](mailto:support@cloudnest.ai) or join our [Discord community](https://discord.gg/cloudnest).

---

<div align="center">
  <p>Made with ❤️ by Mayank Rathore </p>
  <p>
    <a href="https://cloudnest.ai">Website</a> •
    <a href="https://docs.cloudnest.ai">Documentation</a> •
    <a href="https://github.com/Mayank4543/CloudNestAIFrontend/issues">Report Bug</a> •
    <a href="https://github.com/Mayank4543/CloudNestAIFrontend/issues">Request Feature</a>
  </p>
</div>
