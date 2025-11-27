using AutoMapper;
using Job_Application.Dto;
using Job_Application.Interfaces;
using Job_Application.Models;
using Job_Application.Repositories;
using Job_Application.Services;
using Job_Application.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class JobSeekerController : ControllerBase
    {
        private readonly IJobSeekerRepository _repository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly IFileValidationService _fileValidationService;
        private readonly JobApplicationDbContext _context;
        
        public JobSeekerController(
            IJobSeekerRepository repository, 
            IMapper mapper,
            IFileStorageService fileStorageService,
            IFileValidationService fileValidationService,
            JobApplicationDbContext context)
        {
            _repository = repository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _fileValidationService = fileValidationService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobSeekerDto>>>GetAllJobSeekers()
        {
            var seekers = await _repository.GetAllJobSeekers();
            return Ok(_mapper.Map<IEnumerable<JobSeekerDto>>(seekers));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobSeekerDto>>GetJobSeekerById(int id)
        {
            var seeker = await _repository.GetJobSeekerById(id);
            if(seeker == null)
            {
                return NotFound();
            }
            return Ok(_mapper.Map<JobSeekerDto>(seeker));
        }
        [Authorize(Roles = "Admin, JobSeeker")]
        [HttpPut("{id}")]
        public async Task<IActionResult>UpdateJobSeeker(int id, JobSeekerDto dto)
        {
            var seeker = await _repository.GetJobSeekerById(id);
            if( seeker == null)
            {
                return NotFound();
            }
            _mapper.Map(dto, seeker);
            await _repository.UpdateJobSeeker(seeker);
            await _repository.SaveChangesAsync();
            return NoContent();
        }
        [Authorize(Roles = "Admin, JobSeeker")]
        [HttpPost]
        public async Task<ActionResult<JobSeekerDto>>CreateJobSeeker(CreateJobSeekerDto dto)
        {
            var seeker = _mapper.Map<JobSeeker>(dto);
           if(await _repository.GetJobSeekerById(seeker.JobSeekerId) != null)
            {
                return NoContent();
            }
            await _repository.CreateJobSeeker(seeker);
            await _repository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJobSeekerById), new { id = seeker.JobSeekerId }, _mapper.Map<JobSeekerDto>(seeker));
        }
        [Authorize(Roles = "Admin, JobSeeker")]
        [HttpDelete("{id}")]
        public async Task<IActionResult>DeleteJobSeeker(int id)
        {
            var seeker = await _repository.GetJobSeekerById(id);
            if(seeker == null)
            {
                return NotFound();
            }
            await _repository.DeleteJobSeeker(seeker);
            await _repository.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "JobSeeker")]
        [HttpPost("{jobSeekerId}/upload-cv")]
        public async Task<ActionResult<FileUploadResultDto>> UploadCV(int jobSeekerId, IFormFile file)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Get the job seeker
                var jobSeeker = await _context.JobSeekers
                    .Include(js => js.User)
                    .FirstOrDefaultAsync(js => js.JobSeekerId == jobSeekerId);

                if (jobSeeker == null)
                {
                    return NotFound("Job seeker not found");
                }

                // Check if user owns this profile
                if (jobSeeker.UserId != currentUserId)
                {
                    return Forbid("You can only upload CV to your own profile");
                }

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

                // Delete old CV if exists
                if (jobSeeker.ResumeFileId.HasValue)
                {
                    var oldFile = await _context.UploadedFiles
                        .FindAsync(jobSeeker.ResumeFileId.Value);
                    if (oldFile != null)
                    {
                        await _fileStorageService.DeleteFileAsync(oldFile.FilePath);
                        _context.UploadedFiles.Remove(oldFile);
                    }
                }

                // Save new file
                var filePath = await _fileStorageService.SaveFileAsync(file, "cvs", currentUserId);

                // Create database record
                var uploadedFile = new UploadedFile
                {
                    OriginalFileName = file.FileName,
                    StoredFileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    UploadDate = DateTime.UtcNow,
                    UploadedByUserId = currentUserId,
                    FileCategory = "CV"
                };

                _context.UploadedFiles.Add(uploadedFile);
                await _context.SaveChangesAsync();

                // Update job seeker with file reference
                jobSeeker.ResumeFileId = uploadedFile.Id;
                await _context.SaveChangesAsync();

                var fileUploadDto = _mapper.Map<FileUploadDto>(uploadedFile);

                return Ok(new FileUploadResultDto
                {
                    Success = true,
                    Message = "CV uploaded successfully",
                    FileData = fileUploadDto
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new FileUploadResultDto
                {
                    Success = false,
                    Message = "An error occurred while uploading the CV",
                    Errors = new List<string> { "Internal server error" }
                });
            }
        }

        [HttpGet("{id}/cv-info")]
        public async Task<ActionResult<FileInfoDto>> GetJobSeekerCVInfo(int id)
        {
            var jobSeeker = await _context.JobSeekers
                .Include(js => js.ResumeFile)
                .FirstOrDefaultAsync(js => js.JobSeekerId == id);

            if (jobSeeker == null)
            {
                return NotFound("Job seeker not found");
            }

            if (jobSeeker.ResumeFileId == null || jobSeeker.ResumeFile == null)
            {
                return NotFound("No CV uploaded for this job seeker");
            }

            var fileInfo = _mapper.Map<FileInfoDto>(jobSeeker.ResumeFile);
            fileInfo.IsAccessible = _fileStorageService.FileExists(jobSeeker.ResumeFile.FilePath);

            return Ok(fileInfo);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
