
'use client';

import React from 'react';
import Link from 'next/link';


export default function Home() {

  return (
    <div className="font-['Inter',system-ui,sans-serif]">
      {/* Hero Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-[#e6f5ee] text-[#18b26f] px-3 py-1 rounded-full text-sm font-medium mb-6">
                Intelligent Cloud Storage
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Secure cloud storage for all your files
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Store, share, and access your files from anywhere with CloudNest AI&apos;s
                intelligent cloud storage solution. Experience the future of file management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-[#18b26f] text-white font-medium rounded-md hover:bg-[#149d5f] transition-colors text-center"
                >
                  Go to My Dashboard
                </Link>
                <Link
                  href="/upload"
                  className="px-6 py-3 border border-[#18b26f] text-[#18b26f] font-medium rounded-md hover:bg-[#e6f5ee] transition-colors text-center"
                >
                  Upload Files
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-4 -right-4 w-full h-full border-2 border-[#18b26f] rounded-lg"></div>
                <div className="bg-[#e6f5ee] rounded-lg p-8 relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#18b26f] rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Intelligent File Management</h3>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Store unlimited file types
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Fast upload and download
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      AI-powered file insights
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#e6f5ee] text-[#18b26f] px-3 py-1 rounded-full text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Your Files</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              CloudNest AI provides everything you need to store, manage and analyze your files
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#e6f5ee] rounded-lg flex items-center justify-center text-[#18b26f] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy File Upload</h3>
              <p className="text-gray-600">
                Drag and drop or select files to upload. Support for multiple file types and batch uploads.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#e6f5ee] rounded-lg flex items-center justify-center text-[#18b26f] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Organize with Tags</h3>
              <p className="text-gray-600">
                Add custom tags to your files for better organization and quicker retrieval when you need them.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#e6f5ee] rounded-lg flex items-center justify-center text-[#18b26f] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Insights</h3>
              <p className="text-gray-600">
                Get AI-powered insights into your file usage patterns, storage trends, and more.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-[#18b26f] text-white font-medium rounded-md hover:bg-[#149d5f] transition-colors"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#e6f5ee] text-[#18b26f] px-3 py-1 rounded-full text-sm font-medium mb-4">
              How It Works
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Secure, and Smart</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              CloudNest AI makes file management effortless with its intuitive workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e6f5ee] rounded-full flex items-center justify-center text-[#18b26f] mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Files</h3>
              <p className="text-gray-600">
                Drag and drop your files or browse to select. We support all common file types with generous storage limits.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e6f5ee] rounded-full flex items-center justify-center text-[#18b26f] mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Organize & Tag</h3>
              <p className="text-gray-600">
                Add custom tags and organize your files into folders. Our AI also suggests tags based on file content.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e6f5ee] rounded-full flex items-center justify-center text-[#18b26f] mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Access Anywhere</h3>
              <p className="text-gray-600">
                Access your files from any device, anywhere. Share securely with others using custom permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#e6f5ee] text-[#18b26f] px-3 py-1 rounded-full text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thousands of professionals and businesses trust CloudNest AI for their storage needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#e6f5ee] rounded-full flex items-center justify-center text-[#18b26f]">
                  <span className="font-semibold">JD</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">John Doe</h4>
                  <p className="text-sm text-gray-600">Designer</p>
                </div>
              </div>
              <p className="text-gray-600">
                &quot;CloudNest AI has revolutionized how I manage my design files. The AI tagging is incredibly accurate, and I can find what I need in seconds.&quot;
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#e6f5ee] rounded-full flex items-center justify-center text-[#18b26f]">
                  <span className="font-semibold">JS</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Jane Smith</h4>
                  <p className="text-sm text-gray-600">Project Manager</p>
                </div>
              </div>
              <p className="text-gray-600">
                &quot;My team&apos;s productivity has increased by 30% since we switched to CloudNest AI. The insights feature helps us understand our content usage patterns.&quot;
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[#e6f5ee] rounded-full flex items-center justify-center text-[#18b26f]">
                  <span className="font-semibold">RJ</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Robert Johnson</h4>
                  <p className="text-sm text-gray-600">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600">
                &quot;CloudNest AI&apos;s security features give me peace of mind. The interface is intuitive, and the customer support team is always helpful.&quot;
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#18b26f] py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your file management?</h2>
              <p className="text-white/90 text-lg mb-0">
                Join thousands of satisfied users who have improved their productivity with CloudNest AI.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white text-[#18b26f] font-medium rounded-md hover:bg-gray-100 transition-colors text-center"
              >
                Get Started Now
              </Link>
              <Link
                href="#"
                className="px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-[#149d5f] transition-colors text-center"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
