import { useState } from 'react';

const ImagePreview = ({ 
  imageUrl, 
  alt = 'Profile picture', 
  size = 'medium',
  shape = 'circle',
  showPlaceholder = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageUrl);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const getPlaceholderIcon = () => {
    if (shape === 'square') {
      return '🏢'; // Building icon for company logos
    }
    return '👤'; // Person icon for profile pictures
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: '40px', height: '40px', fontSize: '20px' };
      case 'medium':
        return { width: '80px', height: '80px', fontSize: '40px' };
      case 'large':
        return { width: '150px', height: '150px', fontSize: '60px' };
      default:
        return { width: '80px', height: '80px', fontSize: '40px' };
    }
  };

  const shapeClass = shape === 'circle' ? 'rounded-circle' : 'rounded';
  const sizeStyle = getSizeStyle();

  return (
    <div 
      className={`position-relative overflow-hidden bg-light d-flex align-items-center justify-content-center border border-2 border-secondary ${shapeClass}`}
      style={sizeStyle}
    >
      {isLoading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-100 h-100 ${shapeClass}`}
          style={{ 
            objectFit: 'cover',
            display: isLoading ? 'none' : 'block'
          }}
        />
      ) : showPlaceholder ? (
        <div 
          className="w-100 h-100 d-flex align-items-center justify-content-center text-white"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <span style={{ fontSize: sizeStyle.fontSize, opacity: 0.9 }}>
            {getPlaceholderIcon()}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default ImagePreview;
