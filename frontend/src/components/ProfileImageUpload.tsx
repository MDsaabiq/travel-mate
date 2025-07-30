import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfileImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  userName: string;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ 
  onImageUpload, 
  currentImage, 
  userName,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/users/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onImageUpload(response.data.imageUrl);
      toast.success('Profile photo updated successfully!');
      setShowOptions(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to upload profile photo');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
  };

  const removeImage = () => {
    onImageUpload('');
    setShowOptions(false);
    toast.success('Profile photo removed');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative inline-block">
        <div
          className="relative group cursor-pointer"
          onClick={() => setShowOptions(!showOptions)}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {currentImage ? (
            <div className="relative">
              <img
                src={currentImage}
                alt={userName}
                className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ${
                  dragActive ? 'ring-4 ring-teal-500 ring-opacity-50' : ''
                }`}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ) : (
            <div className={`w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors ${
              dragActive ? 'ring-4 ring-teal-500 ring-opacity-50 bg-teal-50' : ''
            }`}>
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
              ) : (
                <div className="text-center">
                  {dragActive ? (
                    <Upload className="w-8 h-8 text-teal-600 mx-auto mb-1" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-600 mb-1">
                        {getInitials(userName)}
                      </div>
                      <Camera className="w-4 h-4 text-gray-400 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options Menu */}
        {showOptions && !uploading && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-10">
            <button
              onClick={handleUploadClick}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{currentImage ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            {currentImage && (
              <button
                onClick={removeImage}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        )}

        {/* Click outside to close options */}
        {showOptions && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowOptions(false)}
          />
        )}
      </div>

      {dragActive && (
        <div className="mt-2 text-center">
          <p className="text-sm text-teal-600 font-medium">Drop image here to upload</p>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
