import { useState, useRef, useEffect } from 'react';

const CameraCapture = ({ onCapture, onCancel }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera for profile pictures
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  if (error) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
        <div className="bg-white rounded p-4 text-center" style={{ maxWidth: '400px' }}>
          <div style={{ fontSize: '64px' }} className="mb-3">📷</div>
          <p className="text-danger mb-3">{error}</p>
          <button className="btn btn-secondary" onClick={handleCancel}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050 }}>
      <div className="bg-black rounded shadow-lg overflow-hidden" style={{ maxWidth: '640px', width: '100%' }}>
        {isLoading && (
          <div className="d-flex flex-column align-items-center justify-content-center text-white p-5">
            <div className="spinner-border text-light mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Starting camera...</p>
          </div>
        )}
        
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-100"
              style={{ 
                display: isLoading ? 'none' : 'block',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
            <div className="d-flex justify-content-between gap-2 p-3 bg-dark bg-opacity-75">
              <button 
                className="btn btn-secondary flex-fill" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success flex-fill" 
                onClick={capturePhoto}
                disabled={isLoading}
                style={{ fontSize: '18px' }}
              >
                <span className="me-2" style={{ fontSize: '24px' }}>📸</span>
                Capture
              </button>
            </div>
          </>
        ) : (
          <>
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-100" 
              style={{ 
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
            <div className="d-flex justify-content-between gap-2 p-3 bg-dark bg-opacity-75">
              <button className="btn btn-secondary flex-fill" onClick={retakePhoto}>
                Retake
              </button>
              <button className="btn btn-primary flex-fill" onClick={confirmCapture}>
                Use Photo
              </button>
            </div>
          </>
        )}
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default CameraCapture;
