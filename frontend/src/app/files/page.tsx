'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesAPI } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { authStorage } from '@/lib/auth-storage';
import { Upload, File, Image, Trash2, Download, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const FilesPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'images' | 'documents'>('images');
  const [uploading, setUploading] = useState(false);

  // Helper function to get auth token from session storage
  const getAuthToken = () => {
    return authStorage.getAccessToken() || '';
  };

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['my-images'],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload/images/my-images`, {
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data || [] };
      } catch (error) {
        console.error('Images API error:', error);
        if (error instanceof Error && error.message.includes('Authentication')) {
          toast.error('กรุณาเข้าสู่ระบบใหม่');
        }
        return { data: [] };
      }
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload/documents/my-documents`, {
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data || [] };
      } catch (error) {
        console.error('Documents API error:', error);
        if (error instanceof Error && error.message.includes('Authentication')) {
          toast.error('กรุณาเข้าสู่ระบบใหม่');
        }
        return { data: [] };
      }
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'images' | 'documents' }) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload/${type}/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-images'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success('File deleted successfully');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      if (error.message.includes('Authentication')) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
      } else {
        toast.error(error.message || 'ลบไฟล์ไม่สำเร็จ');
      }
    },
  });

  const handleDelete = (id: string, type: 'images' | 'documents') => {
    deleteMutation.mutate({ id, type });
  };

  const handleDownload = async (file: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      // Create a temporary link to download the file
      const response = await fetch(file.url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('ดาวน์โหลดไฟล์สำเร็จ');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('ดาวน์โหลดไฟล์ไม่สำเร็จ');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = getAuthToken();
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    // Use correct field name based on backend expectation
    if (uploadType === 'images') {
      formData.append('image', file);
    } else {
      formData.append('document', file);
    }

    try {
      const endpoint = uploadType === 'images' 
        ? '/upload/images/single' 
        : '/upload/documents/single';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}${endpoint}`, {
        method: 'POST',
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      queryClient.invalidateQueries({ queryKey: ['my-images'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success(`อัปโหลด${uploadType === 'images' ? 'รูปภาพ' : 'เอกสาร'}สำเร็จ`);
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message.includes('Authentication')) {
        toast.error('กรุณาเข้าสู่ระบบใหม่');
      } else {
        toast.error(error.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
      }
    } finally {
      setUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const isImageFile = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  const getFileIcon = (filename: string) => {
    if (isImageFile(filename)) {
      return <Image className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateFilename = (filename: string, maxLength: number = 30) => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    
    if (extension) {
      const maxNameLength = maxLength - extension.length - 4; // -4 for "..." and "."
      return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`;
    }
    
    return `${filename.substring(0, maxLength - 3)}...`;
  };

  const isLoading = imagesLoading || documentsLoading;

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            คุณต้องเข้าสู่ระบบเพื่อดูไฟล์ของคุณ
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  const allFiles = [
    ...(images?.data || []).map((file: any) => ({ ...file, type: 'images' })),
    ...(documents?.data || []).map((file: any) => ({ ...file, type: 'documents' }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-responsive-title text-gray-900 dark:text-white transition-colors duration-200">My Files</h1>
          <p className="text-responsive-body text-gray-600 dark:text-gray-300 transition-colors duration-200">Upload and manage your files</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative group">
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as 'images' | 'documents')}
              className="form-input bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
              title="เลือกประเภทไฟล์ที่จะอัปโหลด"
            >
              <option value="images">รูปภาพ</option>
              <option value="documents">เอกสาร</option>
            </select>
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
              เลือกประเภทไฟล์
            </span>
          </div>
          <label className="btn-primary cursor-pointer relative group">
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <span className="text-xs sm:text-sm">อัปโหลด{uploadType === 'images' ? 'รูปภาพ' : 'เอกสาร'}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept={uploadType === 'images' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
              disabled={uploading}
            />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
              {uploading ? 'กำลังอัปโหลด...' : `อัปโหลด${uploadType === 'images' ? 'รูปภาพ' : 'เอกสาร'}`}
            </span>
          </label>
        </div>
      </div>

      {/* Files Grid */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        {allFiles.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {allFiles.map((file: any) => (
              <li key={file.id}>
                <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {isImageFile(file.filename) ? (
                          <div className="relative group">
                            <img
                              src={file.url}
                              alt={file.originalName || file.filename}
                              className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden text-gray-400 dark:text-gray-500">
                              {getFileIcon(file.filename)}
                            </div>
                            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                              {file.mimetype}
                            </span>
                          </div>
                        ) : (
                          <div className="text-gray-400 dark:text-gray-500 relative group h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center" title={file.mimetype}>
                            {getFileIcon(file.filename)}
                            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                              {file.mimetype}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-responsive-subtitle text-gray-900 dark:text-white transition-colors duration-200 cursor-pointer relative group text-truncate">
                            {truncateFilename(file.originalName || file.filename, window.innerWidth < 640 ? 20 : 40)}
                            <span className="absolute top-full left-0 mt-1 px-2 py-1 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 max-w-xs text-truncate">
                              {file.originalName || file.filename}
                            </span>
                          </h3>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-responsive-caption">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.mimetype}</span>
                          <span>•</span>
                          <span>
                            Uploaded {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.type === 'images' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      } transition-colors duration-200`}>
                        {file.type === 'images' ? 'Image' : 'Document'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {file.type === 'images' && (
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 transition-colors duration-200 relative group"
                            title="ดูรูปภาพ"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1 py-0.5 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                              ดูรูปภาพ
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 transition-colors duration-200 relative group"
                          title="ดาวน์โหลดไฟล์"
                        >
                          <Download className="h-4 w-4" />
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1 py-0.5 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                            ดาวน์โหลดไฟล์
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleteId(file.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors duration-200 relative group"
                          title="ลบไฟล์"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1 py-0.5 text-xs text-red-900 bg-red-50 border border-red-200 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                            ลบไฟล์
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No files</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Get started by uploading your first file.
            </p>
            <div className="mt-6">
              <label className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 cursor-pointer transition-colors duration-200">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 transition-colors duration-200">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 transition-colors duration-200">Delete File</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Are you sure you want to delete this file? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const file = allFiles.find(f => f.id === deleteId);
                    if (file) {
                      handleDelete(deleteId, file.type);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;