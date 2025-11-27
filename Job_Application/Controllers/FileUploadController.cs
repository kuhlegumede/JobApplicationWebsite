using AutoMapper;
using Job_Application.Data;
using Job_Application.Dto;
using Job_Application.Models;
using Job_Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;
        private readonly IFileValidationService _fileValidationService;
        private readonly JobApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(
            IFileStorageService fileStorageService,
            IFileValidationService fileValidationService,
            JobApplicationDbContext context,
            IMapper mapper,
            ILogger<FileUploadController> logger)
        {
            _fileStorageService = fileStorageService;
            _fileValidationService = fileValidationService;
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPost("upload-cv")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<ActionResult<FileUploadResultDto>> UploadCV(IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Validate file
                var validationResult = await _fileValidationService.ValidateFileAsync(file);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new FileUploadResultDto
                    {
                        Success = false,
                        Message = "File validation failed",
                        Errors = new List<string> { validationResult.ErrorMessage }
                    });
                }

                // Save file
                var filePath = await _fileStorageService.SaveFileAsync(file, "cvs", userId);

                // Create database record
                var uploadedFile = new UploadedFile
                {
                    OriginalFileName = file.FileName,
                    StoredFileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    UploadDate = DateTime.UtcNow,
                    UploadedByUserId = userId,
                    FileCategory = "CV"
                };

                _context.UploadedFiles.Add(uploadedFile);
                await _context.SaveChangesAsync();

                var fileUploadDto = _mapper.Map<FileUploadDto>(uploadedFile);

                return Ok(new FileUploadResultDto
                {
                    Success = true,
                    Message = "CV uploaded successfully",
                    FileData = fileUploadDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading CV for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new FileUploadResultDto
                {
                    Success = false,
                    Message = "An error occurred while uploading the file",
                    Errors = new List<string> { "Internal server error" }
                });
            }
        }

        [HttpGet("cv/{fileId}")]
        public async Task<IActionResult> DownloadCV(int fileId)
        {
            try
            {
                var file = await _context.UploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == fileId && f.FileCategory == "CV");

                if (file == null)
                {
                    return NotFound("File not found");
                }

                // Check access permissions
                if (!await HasFileAccessAsync(file))
                {
                    return Forbid("Access denied");
                }

                // Check if file exists on disk
                if (!_fileStorageService.FileExists(file.FilePath))
                {
                    return NotFound("File not found on disk");
                }

                var fileStream = await _fileStorageService.GetFileStreamAsync(file.FilePath);
                
                // Determine content disposition based on file type
                var contentDisposition = file.ContentType == "application/pdf" ? "inline" : "attachment";

                Response.Headers["Content-Disposition"] = $"{contentDisposition}; filename=\"{file.OriginalFileName}\"";
                
                return File(fileStream, file.ContentType, file.OriginalFileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file {FileId}", fileId);
                return StatusCode(500, "An error occurred while retrieving the file");
            }
        }

        [HttpDelete("{fileId}")]
        public async Task<IActionResult> DeleteFile(int fileId)
        {
            try
            {
                var file = await _context.UploadedFiles.FindAsync(fileId);
                if (file == null)
                {
                    return NotFound("File not found");
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Only file owner or admin can delete
                if (file.UploadedByUserId != userId && userRole != "Admin")
                {
                    return Forbid("Access denied");
                }

                // Delete from storage
                await _fileStorageService.DeleteFileAsync(file.FilePath);

                // Delete from database
                _context.UploadedFiles.Remove(file);
                await _context.SaveChangesAsync();

                return Ok(new { message = "File deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {FileId}", fileId);
                return StatusCode(500, "An error occurred while deleting the file");
            }
        }

        [HttpGet("info/{fileId}")]
        public async Task<ActionResult<FileInfoDto>> GetFileInfo(int fileId)
        {
            try
            {
                var file = await _context.UploadedFiles.FindAsync(fileId);
                if (file == null)
                {
                    return NotFound("File not found");
                }

                if (!await HasFileAccessAsync(file))
                {
                    return Forbid("Access denied");
                }

                var fileInfo = _mapper.Map<FileInfoDto>(file);
                fileInfo.IsAccessible = _fileStorageService.FileExists(file.FilePath);

                return Ok(fileInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file info {FileId}", fileId);
                return StatusCode(500, "An error occurred while retrieving file information");
            }
        }

        [HttpPost("upload-profile-picture")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<ActionResult<FileUploadResultDto>> UploadJobSeekerProfilePicture(IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Validate image file
                var validationResult = await _fileValidationService.ValidateImageFileAsync(file);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new FileUploadResultDto
                    {
                        Success = false,
                        Message = "Image validation failed",
                        Errors = new List<string> { validationResult.ErrorMessage }
                    });
                }

                // Save file
                var filePath = await _fileStorageService.SaveFileAsync(file, "profile-pictures/jobseekers", userId);

                // Create database record
                var uploadedFile = new UploadedFile
                {
                    OriginalFileName = file.FileName,
                    StoredFileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    UploadDate = DateTime.UtcNow,
                    UploadedByUserId = userId,
                    FileCategory = "ProfilePicture"
                };

                _context.UploadedFiles.Add(uploadedFile);
                await _context.SaveChangesAsync();

                // Update JobSeeker profile with new picture
                var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);
                if (jobSeeker != null)
                {
                    // Delete old profile picture if exists
                    if (jobSeeker.ProfilePictureFileId.HasValue)
                    {
                        var oldFile = await _context.UploadedFiles.FindAsync(jobSeeker.ProfilePictureFileId.Value);
                        if (oldFile != null)
                        {
                            await _fileStorageService.DeleteFileAsync(oldFile.FilePath);
                            _context.UploadedFiles.Remove(oldFile);
                        }
                    }

                    jobSeeker.ProfilePictureFileId = uploadedFile.Id;
                    await _context.SaveChangesAsync();
                }

                var fileUploadDto = _mapper.Map<FileUploadDto>(uploadedFile);

                return Ok(new FileUploadResultDto
                {
                    Success = true,
                    Message = "Profile picture uploaded successfully",
                    FileData = fileUploadDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new FileUploadResultDto
                {
                    Success = false,
                    Message = "An error occurred while uploading the profile picture",
                    Errors = new List<string> { "Internal server error" }
                });
            }
        }

        [HttpPost("upload-profile-picture-base64")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<ActionResult<FileUploadResultDto>> UploadJobSeekerProfilePictureBase64([FromBody] Base64ImageDto imageDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Convert base64 to IFormFile
                var imageBytes = Convert.FromBase64String(imageDto.Base64String);
                var stream = new MemoryStream(imageBytes);
                var formFile = new FormFile(stream, 0, imageBytes.Length, "image", imageDto.FileName)
                {
                    Headers = new HeaderDictionary(),
                    ContentType = imageDto.ContentType ?? "image/jpeg"
                };

                // Validate image file
                var validationResult = await _fileValidationService.ValidateImageFileAsync(formFile);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new FileUploadResultDto
                    {
                        Success = false,
                        Message = "Image validation failed",
                        Errors = new List<string> { validationResult.ErrorMessage }
                    });
                }

                // Save file
                var filePath = await _fileStorageService.SaveFileAsync(formFile, "profile-pictures/jobseekers", userId);

                // Create database record
                var uploadedFile = new UploadedFile
                {
                    OriginalFileName = imageDto.FileName,
                    StoredFileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    FileSize = imageBytes.Length,
                    ContentType = formFile.ContentType,
                    UploadDate = DateTime.UtcNow,
                    UploadedByUserId = userId,
                    FileCategory = "ProfilePicture"
                };

                _context.UploadedFiles.Add(uploadedFile);
                await _context.SaveChangesAsync();

                // Update JobSeeker profile with new picture
                var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);
                if (jobSeeker != null)
                {
                    // Delete old profile picture if exists
                    if (jobSeeker.ProfilePictureFileId.HasValue)
                    {
                        var oldFile = await _context.UploadedFiles.FindAsync(jobSeeker.ProfilePictureFileId.Value);
                        if (oldFile != null)
                        {
                            await _fileStorageService.DeleteFileAsync(oldFile.FilePath);
                            _context.UploadedFiles.Remove(oldFile);
                        }
                    }

                    jobSeeker.ProfilePictureFileId = uploadedFile.Id;
                    await _context.SaveChangesAsync();
                }

                var fileUploadDto = _mapper.Map<FileUploadDto>(uploadedFile);

                return Ok(new FileUploadResultDto
                {
                    Success = true,
                    Message = "Profile picture uploaded successfully",
                    FileData = fileUploadDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture (base64) for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new FileUploadResultDto
                {
                    Success = false,
                    Message = "An error occurred while uploading the profile picture",
                    Errors = new List<string> { "Internal server error" }
                });
            }
        }

        [HttpPost("upload-company-logo")]
        [Authorize(Roles = "Employer")]
        public async Task<ActionResult<FileUploadResultDto>> UploadCompanyLogo(IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Validate image file
                var validationResult = await _fileValidationService.ValidateImageFileAsync(file);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new FileUploadResultDto
                    {
                        Success = false,
                        Message = "Image validation failed",
                        Errors = new List<string> { validationResult.ErrorMessage }
                    });
                }

                // Save file
                var filePath = await _fileStorageService.SaveFileAsync(file, "profile-pictures/employers", userId);

                // Create database record
                var uploadedFile = new UploadedFile
                {
                    OriginalFileName = file.FileName,
                    StoredFileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    UploadDate = DateTime.UtcNow,
                    UploadedByUserId = userId,
                    FileCategory = "CompanyLogo"
                };

                _context.UploadedFiles.Add(uploadedFile);
                await _context.SaveChangesAsync();

                // Update Employer profile with new logo
                var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
                if (employer != null)
                {
                    // Delete old logo if exists
                    if (employer.CompanyLogoFileId.HasValue)
                    {
                        var oldFile = await _context.UploadedFiles.FindAsync(employer.CompanyLogoFileId.Value);
                        if (oldFile != null)
                        {
                            await _fileStorageService.DeleteFileAsync(oldFile.FilePath);
                            _context.UploadedFiles.Remove(oldFile);
                        }
                    }

                    employer.CompanyLogoFileId = uploadedFile.Id;
                    await _context.SaveChangesAsync();
                }

                var fileUploadDto = _mapper.Map<FileUploadDto>(uploadedFile);

                return Ok(new FileUploadResultDto
                {
                    Success = true,
                    Message = "Company logo uploaded successfully",
                    FileData = fileUploadDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading company logo for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new FileUploadResultDto
                {
                    Success = false,
                    Message = "An error occurred while uploading the company logo",
                    Errors = new List<string> { "Internal server error" }
                });
            }
        }

        [HttpGet("profile-picture/{fileId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProfilePicture(int fileId)
        {
            try
            {
                var file = await _context.UploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == fileId && 
                        (f.FileCategory == "ProfilePicture" || f.FileCategory == "CompanyLogo"));

                if (file == null)
                {
                    return NotFound("Image not found");
                }

                // Check if file exists on disk
                if (!_fileStorageService.FileExists(file.FilePath))
                {
                    return NotFound("Image not found on disk");
                }

                var fileStream = await _fileStorageService.GetFileStreamAsync(file.FilePath);
                
                // Set cache headers for better performance
                Response.Headers["Cache-Control"] = "public, max-age=31536000"; // 1 year
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{file.OriginalFileName}\"";
                
                return File(fileStream, file.ContentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving profile picture {FileId}", fileId);
                return StatusCode(500, "An error occurred while retrieving the image");
            }
        }

        [HttpDelete("profile-picture/{fileId}")]
        [Authorize]
        public async Task<IActionResult> DeleteProfilePicture(int fileId)
        {
            try
            {
                var file = await _context.UploadedFiles.FindAsync(fileId);
                if (file == null)
                {
                    return NotFound("Image not found");
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Only file owner or admin can delete
                if (file.UploadedByUserId != userId && userRole != "Admin")
                {
                    return Forbid("Access denied");
                }

                // Update references before deleting
                if (file.FileCategory == "ProfilePicture")
                {
                    var jobSeeker = await _context.JobSeekers
                        .FirstOrDefaultAsync(js => js.ProfilePictureFileId == fileId);
                    if (jobSeeker != null)
                    {
                        jobSeeker.ProfilePictureFileId = null;
                    }
                }
                else if (file.FileCategory == "CompanyLogo")
                {
                    var employer = await _context.Employers
                        .FirstOrDefaultAsync(e => e.CompanyLogoFileId == fileId);
                    if (employer != null)
                    {
                        employer.CompanyLogoFileId = null;
                    }
                }

                // Delete from storage
                await _fileStorageService.DeleteFileAsync(file.FilePath);

                // Delete from database
                _context.UploadedFiles.Remove(file);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile picture {FileId}", fileId);
                return StatusCode(500, "An error occurred while deleting the image");
            }
        }

        private async Task<bool> HasFileAccessAsync(UploadedFile file)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            // Admin has access to all files
            if (userRole == "Admin")
                return true;

            // File owner has access
            if (file.UploadedByUserId == userId)
                return true;

            // Employers can access CVs of applicants to their job posts
            if (userRole == "Employer" && file.FileCategory == "CV")
            {
                var hasAccess = await _context.JobApplications
                    .Include(ja => ja.JobPost)
                    .Include(ja => ja.JobSeeker)
                    .AnyAsync(ja => ja.JobPost.Employer.UserId == userId && 
                                   ja.JobSeeker.ResumeFileId == file.Id);
                return hasAccess;
            }

            return false;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        }
    }
}