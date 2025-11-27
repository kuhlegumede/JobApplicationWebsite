using AutoMapper;
using Job_Application.Dto;
using Job_Application.Models;
using Job_Application.Repositories;
using Job_Application.Interfaces;
using Job_Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Job_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobApplicationController : ControllerBase
    {
        private readonly IJobApplicationRepository _repository;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IJobPostRepository _jobPostRepository;
        private readonly IEmployerRepository _employerRepository;
        private readonly IJobSeekerRepository _jobSeekerRepository;

        public JobApplicationController(
            IJobApplicationRepository repository, 
            IMapper mapper,
            INotificationService notificationService,
            IJobPostRepository jobPostRepository,
            IEmployerRepository employerRepository,
            IJobSeekerRepository jobSeekerRepository)
        {
            _repository = repository;
            _mapper = mapper;
            _notificationService = notificationService;
            _jobPostRepository = jobPostRepository;
            _employerRepository = employerRepository;
            _jobSeekerRepository = jobSeekerRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAllApplications()
        {
            var applications = await _repository.GetAllApplications();
            return Ok(_mapper.Map<IEnumerable<JobApplicationDto>>(applications));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobApplicationDto>> GetApplicationById(int id)
        {
            var application = await _repository.GetApplicationById(id);
            if (application == null)
            {
                return NotFound();
            }
            return Ok(_mapper.Map<JobApplicationDto>(application));
        }

        [HttpGet("jobseeker/{jobSeekerId}")]
        [Authorize(Roles = "Admin,JobSeeker")]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetApplicationsByJobSeeker(int jobSeekerId)
        {
            var applications = await _repository.GetApplicationsByJobSeeker(jobSeekerId);
            var result = _mapper.Map<IEnumerable<JobApplicationDto>>(applications);
            if (result == null)
            {
                return Ok(new List<JobApplicationDto>()); // Always return an empty array if no applications
            }
            return Ok(result);
        }

        [HttpGet("jobpost/{jobPostId}")]
        [Authorize(Roles = "Admin,Employer")]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetApplicationsByJobPost(int jobPostId)
        {
            var applications = await _repository.GetApplicationsByJobPost(jobPostId);
            var result = _mapper.Map<IEnumerable<JobApplicationDto>>(applications);
            if (result == null)
            {
                return Ok(new List<JobApplicationDto>()); // Always return an empty array if no applications
            }
            return Ok(result);
        }

        [Authorize(Roles = "Admin, JobSeeker")]
        [HttpPost]
        public async Task<ActionResult<JobApplicationDto>>CreateApplication(CreateJobApplicationDto dto)
        {
            // Check if user has already applied to this job
            var existingApplication = await _repository.GetApplicationByJobSeekerAndJobPost(dto.JobSeekerId, dto.JobPostId);
            if (existingApplication != null)
            {
                return BadRequest(new { message = "You have already applied to this job" });
            }

            var application = _mapper.Map<JobApplication>(dto);
            await _repository.CreateApplication(application);
            await _repository.SaveChangesAsync();
            
            // Send notification to employer
            try
            {
                var jobPost = await _jobPostRepository.GetJobPostById(application.JobPostId);
                if (jobPost != null)
                {
                    var employer = await _employerRepository.GetEmployerById(jobPost.EmployerId);
                    var jobSeeker = await _jobSeekerRepository.GetJobSeekerById(application.JobSeekerId);
                    
                    if (employer != null && jobSeeker != null && jobSeeker.User != null)
                    {
                        await _notificationService.CreateNotification(
                            userId: employer.UserId,
                            title: "New Job Application",
                            message: $"{jobSeeker.User.FirstName} {jobSeeker.User.LastName} has applied for {jobPost.Title}",
                            relatedEntityId: application.JobApplicationId,
                            notificationType: "Application"
                        );
                    }
                }
            }
            catch (Exception ex)
            {
                // Log but don't fail the request if notification fails
                Console.WriteLine($"Failed to send notification: {ex.Message}");
            }
            
            return CreatedAtAction(nameof(GetApplicationById), new { id = application.JobApplicationId }, _mapper.Map<JobApplicationDto>(application));
        }

        [Authorize(Roles = "Admin, JobSeeker")]
        [HttpPut("{id}")]
        public async Task<IActionResult>UpdateApplication(int id, JobApplicationDto dto)
        {
            var application = await _repository.GetApplicationById(id);
            if (application == null)
            {
                return NotFound();
            }
            _mapper.Map(dto, application);
            await _repository.UpdateApplication(application);
            await _repository.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin,Employer")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, UpdateApplicationStatusDto dto)
        {
            var application = await _repository.GetApplicationById(id);
            if (application == null)
            {
                return NotFound(new { message = "Application not found" });
            }
            
            application.ApplicationStatus = dto.ApplicationStatus;
            application.LastUpdated = DateTime.UtcNow;
            
            await _repository.UpdateApplication(application);
            await _repository.SaveChangesAsync();
            
            // Send notification to job seeker
            try
            {
                var jobPost = await _jobPostRepository.GetJobPostById(application.JobPostId);
                var jobSeeker = await _jobSeekerRepository.GetJobSeekerById(application.JobSeekerId);
                
                if (jobPost != null && jobSeeker != null)
                {
                    var statusMessage = dto.ApplicationStatus switch
                    {
                        ApplicationStatus.UnderReview => "is now under review",
                        ApplicationStatus.Interview => "has progressed to interview stage",
                        ApplicationStatus.Hired => "has been accepted! Congratulations!",
                        ApplicationStatus.Rejected => "was not successful this time",
                        ApplicationStatus.Submitted => "has been received",
                        _ => "has been updated"
                    };
                    
                    await _notificationService.CreateNotification(
                        userId: jobSeeker.UserId,
                        title: "Application Status Update",
                        message: $"Your application for {jobPost.Title} {statusMessage}",
                        relatedEntityId: application.JobApplicationId,
                        notificationType: "StatusUpdate"
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send notification: {ex.Message}");
            }
            
            return Ok(new { message = "Application status updated successfully", status = dto.ApplicationStatus });
        }

        [Authorize(Roles = "Admin, JobSeeker")]
        [HttpDelete("{id}")]
        public async Task<IActionResult>DeleteApplication(int id)
        {
            var application = await _repository.GetApplicationById(id);
            if(application == null)
            {
                return NoContent();
            }
            await _repository.DeleteApplication(application);
            await _repository.SaveChangesAsync();
            return NoContent();
        }
    }
}
