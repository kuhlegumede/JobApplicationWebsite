import { useState, useRef } from 'react';
import CameraCapture from './CameraCapture';
import ImagePreview from './ImagePreview';

const ProfilePictureUpload = ({ 
  currentImage, 
  onUpload, 
  userType = 'jobseeker',
  label = 'Profile Picture'
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const supportsCameraAPI = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCameraCapture = (file) => {
    setShowCamera(false);
    validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile);
      // Clear preview after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="my-4">
      <label className="form-label fw-semibold fs-6">{label}</label>
      
      <div className="d-flex flex-column align-items-center gap-3">
        {/* Current or Preview Image */}
        <div className="mb-2">
          <ImagePreview
            imageUrl={previewUrl || currentImage}
            alt={label}
            size="large"
            shape={userType === 'employer' ? 'square' : 'circle'}
          />
        </div>

        {/* Upload Options */}
        {!selectedFile ? (
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={handleBrowseClick}
            >
              <span>📁</span>
              Choose File
            </button>

            {supportsCameraAPI() && userType === 'jobseeker' && (
              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={() => setShowCamera(true)}
              >
                <span>📷</span>
                Take Photo
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="d-flex gap-2 w-100" style={{ maxWidth: '300px' }}>
            <button
              type="button"
              className="btn btn-secondary flex-fill"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary flex-fill"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center w-100" style={{ maxWidth: '400px' }} role="alert">
            <span className="me-2">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-muted small text-center mb-0" style={{ maxWidth: '400px' }}>
          Recommended: JPG, PNG, or WebP. Max size: 2MB.
          {userType === 'employer' && ' Square images work best for logos.'}
        </p>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ProfilePictureUpload;
