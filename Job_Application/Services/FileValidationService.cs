using Microsoft.Extensions.Options;
using System.IO;

namespace Job_Application.Services
{
    public interface IFileValidationService
    {
        Task<ValidationResult> ValidateFileAsync(IFormFile file);
        Task<ValidationResult> ValidateImageFileAsync(IFormFile file);
        bool IsValidExtension(string fileName);
        bool IsValidMimeType(string contentType);
        bool IsValidFileSize(long fileSize);
        Task<bool> IsValidFileContentAsync(IFormFile file);
        bool IsValidImageExtension(string fileName);
        bool IsValidImageMimeType(string contentType);
        bool IsValidImageSize(long fileSize);
        Task<bool> IsValidImageContentAsync(IFormFile file);
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        
        public static ValidationResult Success() => new() { IsValid = true };
        public static ValidationResult Failure(string message) => new() { IsValid = false, ErrorMessage = message };
    }

    public class FileValidationService : IFileValidationService
    {
        private readonly FileStorageOptions _options;
        private readonly ILogger<FileValidationService> _logger;

        // File signature headers for security validation
        private readonly Dictionary<string, List<byte[]>> _fileSignatures = new()
        {
            {
                ".pdf", new List<byte[]>
                {
                    new byte[] { 0x25, 0x50, 0x44, 0x46 } // %PDF
                }
            },
            {
                ".doc", new List<byte[]>
                {
                    new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } // MS Office older format
                }
            },
            {
                ".docx", new List<byte[]>
                {
                    new byte[] { 0x50, 0x4B, 0x03, 0x04 }, // ZIP format (DOCX is ZIP-based)
                    new byte[] { 0x50, 0x4B, 0x07, 0x08 },
                    new byte[] { 0x50, 0x4B, 0x05, 0x06 }
                }
            },
            {
                ".jpg", new List<byte[]>
                {
                    new byte[] { 0xFF, 0xD8, 0xFF } // JPEG
                }
            },
            {
                ".jpeg", new List<byte[]>
                {
                    new byte[] { 0xFF, 0xD8, 0xFF } // JPEG
                }
            },
            {
                ".png", new List<byte[]>
                {
                    new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } // PNG
                }
            },
            {
                ".webp", new List<byte[]>
                {
                    new byte[] { 0x52, 0x49, 0x46, 0x46 } // RIFF 
                }
            }
        };

        public FileValidationService(IOptions<FileStorageOptions> options, ILogger<FileValidationService> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task<ValidationResult> ValidateFileAsync(IFormFile file)
        {
            try
            {
                // Check if file exists
                if (file == null || file.Length == 0)
                {
                    return ValidationResult.Failure("No file uploaded or file is empty.");
                }

                // Check file size
                if (!IsValidFileSize(file.Length))
                {
                    var maxSizeMB = _options.MaxFileSizeBytes / (1024.0 * 1024.0);
                    return ValidationResult.Failure($"File size exceeds maximum allowed size of {maxSizeMB:F1}MB.");
                }

                // Check file extension
                if (!IsValidExtension(file.FileName))
                {
                    var allowedExtensions = string.Join(", ", _options.AllowedExtensions);
                    return ValidationResult.Failure($"File extension not allowed. Allowed extensions: {allowedExtensions}");
                }

                // Check MIME type
                if (!IsValidMimeType(file.ContentType))
                {
                    var allowedTypes = string.Join(", ", _options.AllowedMimeTypes);
                    return ValidationResult.Failure($"File type not allowed. Allowed types: {allowedTypes}");
                }

                // Check file content headers
                if (!await IsValidFileContentAsync(file))
                {
                    return ValidationResult.Failure("File content does not match the expected format for the file extension.");
                }

                _logger.LogInformation("File validation passed for: {FileName}", file.FileName);
                return ValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating file: {FileName}", file.FileName);
                return ValidationResult.Failure("An error occurred while validating the file.");
            }
        }

        public bool IsValidExtension(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return false;

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return _options.AllowedExtensions.Contains(extension);
        }

        public bool IsValidMimeType(string contentType)
        {
            if (string.IsNullOrEmpty(contentType))
                return false;

            return _options.AllowedMimeTypes.Contains(contentType.ToLowerInvariant());
        }

        public bool IsValidFileSize(long fileSize)
        {
            return fileSize > 0 && fileSize <= _options.MaxFileSizeBytes;
        }

        public Task<bool> IsValidFileContentAsync(IFormFile file)
        {
            try
            {
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!_fileSignatures.ContainsKey(extension))
                {
                    // If signature validation does not exist for this extension, check that it's in our allowed list
                    return Task.FromResult(IsValidExtension(file.FileName));
                }

                var signatures = _fileSignatures[extension];
                
                using var reader = new BinaryReader(file.OpenReadStream());
                var headerBytes = reader.ReadBytes(8); // Read first 8 bytes for signature check
                
                // Reset stream position for future use
                file.OpenReadStream().Position = 0;
                
                var isValid = signatures.Any(signature => 
                    headerBytes.Take(signature.Length).SequenceEqual(signature));
                
                return Task.FromResult(isValid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating file content for: {FileName}", file.FileName);
                return Task.FromResult(false);
            }
        }

        public async Task<ValidationResult> ValidateImageFileAsync(IFormFile file)
        {
            try
            {
                // Check if file exists
                if (file == null || file.Length == 0)
                {
                    return ValidationResult.Failure("No image uploaded or file is empty.");
                }

                // Check file size
                if (!IsValidImageSize(file.Length))
                {
                    var maxSizeMB = _options.MaxImageSizeBytes / (1024.0 * 1024.0);
                    return ValidationResult.Failure($"Image size exceeds maximum allowed size of {maxSizeMB:F1}MB.");
                }

                // Check file extension
                if (!IsValidImageExtension(file.FileName))
                {
                    var allowedExtensions = string.Join(", ", _options.AllowedImageExtensions);
                    return ValidationResult.Failure($"Image extension not allowed. Allowed extensions: {allowedExtensions}");
                }

                // Check MIME type
                if (!IsValidImageMimeType(file.ContentType))
                {
                    var allowedTypes = string.Join(", ", _options.AllowedImageMimeTypes);
                    return ValidationResult.Failure($"Image type not allowed. Allowed types: {allowedTypes}");
                }

                // Check file content headers
                if (!await IsValidImageContentAsync(file))
                {
                    return ValidationResult.Failure("Image content does not match the expected format for the file extension.");
                }

                _logger.LogInformation("Image validation passed for: {FileName}", file.FileName);
                return ValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating image: {FileName}", file.FileName);
                return ValidationResult.Failure("An error occurred while validating the image.");
            }
        }

        public bool IsValidImageExtension(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return false;

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return _options.AllowedImageExtensions.Contains(extension);
        }

        public bool IsValidImageMimeType(string contentType)
        {
            if (string.IsNullOrEmpty(contentType))
                return false;

            return _options.AllowedImageMimeTypes.Contains(contentType.ToLowerInvariant());
        }

        public bool IsValidImageSize(long fileSize)
        {
            return fileSize > 0 && fileSize <= _options.MaxImageSizeBytes;
        }

        public Task<bool> IsValidImageContentAsync(IFormFile file)
        {
            try
            {
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!_fileSignatures.ContainsKey(extension))
                {
                    // If signature validation does not exist for this extension, check that it's in our allowed list
                    return Task.FromResult(IsValidImageExtension(file.FileName));
                }

                var signatures = _fileSignatures[extension];
                
                using var reader = new BinaryReader(file.OpenReadStream());
                var headerBytes = reader.ReadBytes(8); // Read first 8 bytes for signature check
                
                // Reset stream position for future use
                file.OpenReadStream().Position = 0;
                
                var isValid = signatures.Any(signature => 
                    headerBytes.Take(signature.Length).SequenceEqual(signature));
                
                return Task.FromResult(isValid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating image content for: {FileName}", file.FileName);
                return Task.FromResult(false);
            }
        }
    }
}