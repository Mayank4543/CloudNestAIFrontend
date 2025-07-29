import React, { useState, ChangeEvent, FormEvent } from 'react';

const UploadForm: React.FC = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [tags, setTags] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
            // Reset success message if new files are selected
            setUploadSuccess(false);
        }
    };

    // Handle tag input
    const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTags(e.target.value);
    };

    // Mock upload function
    const uploadFiles = async (): Promise<void> => {
        return new Promise((resolve) => {
            // Simulate API call delay
            setTimeout(() => {
                console.log('Files uploaded:', files);
                console.log('Tags:', tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''));
                resolve();
            }, 1500);
        });
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!files || files.length === 0) {
            alert('Please select at least one file');
            return;
        }

        setIsUploading(true);

        try {
            await uploadFiles();
            setUploadSuccess(true);
            // Reset form
            setFiles(null);
            setTags('');
            // Reset the file input by targeting the form element
            const form = e.target as HTMLFormElement;
            form.reset();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 my-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Files</h2>

            {uploadSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Files uploaded successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Files
                    </label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus-within:outline-none">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    You can select multiple files
                                </p>
                            </div>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                </div>

                {/* File Preview */}
                {files && files.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
                        <ul className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                            {Array.from(files).map((file, index) => (
                                <li key={index} className="text-sm text-gray-600 flex justify-between">
                                    <span className="truncate max-w-xs">{file.name}</span>
                                    <span className="text-gray-400">{formatFileSize(file.size)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tags Input */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma separated, optional)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={handleTagChange}
                        placeholder="tag1, tag2, tag3"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isUploading || !files}
                        className={`
              px-4 py-2 rounded-md text-sm font-medium text-white
              ${isUploading || !files
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }
            `}
                    >
                        {isUploading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </span>
                        ) : 'Upload Files'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadForm;
