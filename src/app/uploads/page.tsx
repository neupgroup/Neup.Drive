'use client';

import { useState, useRef } from 'react';
import { Upload, File, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  uploadedBytes: number;
  totalBytes: number;
  startTime: number;
  estimatedTimeRemaining: number | null;
  speed: number | null;
  error?: string;
}

export default function UploadsPage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = 'http://13.212.177.159:8080/upload';

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return 'Calculating...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const uploadFile = async (file: File) => {
    const uploadId = `${Date.now()}-${file.name}`;
    const newUpload: UploadProgress = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      uploadedBytes: 0,
      totalBytes: file.size,
      startTime: Date.now(),
      estimatedTimeRemaining: null,
      speed: null,
    };

    setUploads((prev) => [...prev, newUpload]);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        const elapsedTime = (Date.now() - newUpload.startTime) / 1000; // in seconds
        const speed = e.loaded / elapsedTime; // bytes per second
        const remainingBytes = e.total - e.loaded;
        const estimatedTimeRemaining = remainingBytes / speed;

        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  progress,
                  uploadedBytes: e.loaded,
                  status: 'uploading',
                  speed,
                  estimatedTimeRemaining,
                }
              : upload
          )
        );
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  progress: 100,
                  status: 'success',
                  estimatedTimeRemaining: 0,
                }
              : upload
          )
        );
      } else {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? {
                  ...upload,
                  status: 'error',
                  error: `Upload failed: ${xhr.statusText}`,
                }
              : upload
          )
        );
      }
    });

    xhr.addEventListener('error', () => {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: 'error',
                error: 'Network error occurred',
              }
            : upload
        )
      );
    });

    xhr.open('POST', API_URL);
    xhr.send(formData);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      uploadFile(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const totalUploading = uploads.filter((u) => u.status === 'uploading').length;
  const totalSuccess = uploads.filter((u) => u.status === 'success').length;
  const totalFailed = uploads.filter((u) => u.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            File Upload Center
          </h1>
          <p className="text-slate-400 text-lg">
            Upload files with real-time progress tracking and speed analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Uploading</p>
                <p className="text-3xl font-bold text-blue-400">{totalUploading}</p>
              </div>
              <Zap className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-400">{totalSuccess}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-400">{totalFailed}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative overflow-hidden cursor-pointer
            bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl
            border-2 border-dashed rounded-3xl p-16 mb-8
            transition-all duration-300 ease-out
            hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20
            ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                : 'border-slate-600/50 hover:border-purple-500/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-6">
              <Upload className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-slate-400">
              Support for files up to 4GB • Multiple files supported
            </p>
          </div>

          {/* Animated gradient border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        </div>

        {/* Upload List */}
        {uploads.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Queue</h2>
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <File className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate mb-1">
                        {upload.file.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {formatBytes(upload.totalBytes)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {upload.status === 'success' && (
                      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">Complete</span>
                      </div>
                    )}
                    {upload.status === 'error' && (
                      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm font-medium">Failed</span>
                      </div>
                    )}
                    {upload.status === 'uploading' && (
                      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <span className="text-blue-400 text-sm font-medium">Uploading</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {(upload.status === 'uploading' || upload.status === 'pending') && (
                  <div className="mb-4">
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-300 ease-out relative overflow-hidden"
                        style={{ width: `${upload.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-slate-400">
                        {formatBytes(upload.uploadedBytes)} / {formatBytes(upload.totalBytes)}
                      </span>
                      <span className="text-purple-400 font-medium">
                        {upload.progress.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Upload Stats */}
                {upload.status === 'uploading' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="text-xs text-slate-500">Speed</p>
                        <p className="text-sm text-white font-medium">
                          {upload.speed ? `${formatBytes(upload.speed)}/s` : 'Calculating...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">Time Remaining</p>
                        <p className="text-sm text-white font-medium">
                          {upload.estimatedTimeRemaining !== null
                            ? formatTime(upload.estimatedTimeRemaining)
                            : 'Calculating...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {upload.status === 'error' && upload.error && (
                  <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{upload.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {uploads.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
              <Upload className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-lg">No uploads yet. Start by selecting files above.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
