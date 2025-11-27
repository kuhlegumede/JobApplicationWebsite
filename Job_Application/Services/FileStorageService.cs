using Microsoft.Extensions.Options;
using System.IO;

namespace Job_Application.Services
{
    public class FileStorageOptions
    {
        public string UploadBasePath { get; set; } = "wwwroot/uploads";
        public string CvPath { get; set; } = "cvs";
        public string ProfilePicturePath { get; set; } = "profile-pictures";
        public long MaxFileSizeBytes { get; set; } = 5242880; // 5MB
        public long MaxImageSizeBytes { get; set; } = 2097152; // 2MB
        public string[] AllowedExtensions { get; set; } = { ".pdf", ".doc", ".docx" };
        public string[] AllowedMimeTypes { get; set; } = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };
        public string[] AllowedImageExtensions { get; set; } = { ".jpg", ".jpeg", ".png", ".webp" };
        public string[] AllowedImageMimeTypes { get; set; } = {
            "image/jpeg",
            "image/png",
            "image/webp"
        };
        public int CleanupOrphanedFilesHours { get; set; } = 24;
    }

    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string category, int userId);
        Task<bool> DeleteFileAsync(string filePath);
        Task<Stream> GetFileStreamAsync(string filePath);
        bool FileExists(string filePath);
        string GetFullPath(string relativePath);
        Task CleanupOrphanedFilesAsync();
    }

    public class FileStorageService : IFileStorageService
    {
        private readonly FileStorageOptions _options;
        private readonly ILogger<FileStorageService> _logger;

        public FileStorageService(IOptions<FileStorageOptions> options, ILogger<FileStorageService> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string category, int userId)
        {
            try
            {
                // Generate unique filename with GUID
                var fileExtension = Path.GetExtension(file.FileName);
                var storedFileName = $"{Guid.NewGuid()}{fileExtension}";
                
                // Create user-specific directory path
                var userDirectory = Path.Combine(_options.UploadBasePath, category, userId.ToString());
                var fullDirectory = Path.Combine(Directory.GetCurrentDirectory(), userDirectory);
                
                // Ensure directory exists
                Directory.CreateDirectory(fullDirectory);
                
                // Full file path
                var fullFilePath = Path.Combine(fullDirectory, storedFileName);
                var relativePath = Path.Combine(userDirectory, storedFileName);
                
                // Save file
                using (var stream = new FileStream(fullFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                _logger.LogInformation("File saved successfully: {FilePath}", relativePath);
                return relativePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file: {FileName}", file.FileName);
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                var fullPath = GetFullPath(filePath);
                
                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                    _logger.LogInformation("File deleted successfully: {FilePath}", filePath);
                    return true;
                }
                
                _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<Stream> GetFileStreamAsync(string filePath)
        {
            var fullPath = GetFullPath(filePath);
            
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }
            
            return await Task.FromResult(new FileStream(fullPath, FileMode.Open, FileAccess.Read));
        }

        public bool FileExists(string filePath)
        {
            var fullPath = GetFullPath(filePath);
            return File.Exists(fullPath);
        }

        public string GetFullPath(string relativePath)
        {
            return Path.Combine(Directory.GetCurrentDirectory(), relativePath);
        }

        public async Task CleanupOrphanedFilesAsync()
        {
            try
            {
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), _options.UploadBasePath);
                
                if (!Directory.Exists(uploadPath))
                    return;

                var cutoffTime = DateTime.UtcNow.AddHours(-_options.CleanupOrphanedFilesHours);
                
                await Task.Run(() =>
                {
                    var files = Directory.GetFiles(uploadPath, "*.*", SearchOption.AllDirectories)
                        .Where(f => File.GetCreationTimeUtc(f) < cutoffTime);
                    
                    foreach (var file in files)
                    {
                        try
                        {
                            File.Delete(file);
                            _logger.LogInformation("Cleaned up orphaned file: {FilePath}", file);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error cleaning up file: {FilePath}", file);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during file cleanup");
            }
        }
    }
}