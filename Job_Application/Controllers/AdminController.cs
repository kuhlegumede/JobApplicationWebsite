using AutoMapper;
using Job_Application.Dto;
using Job_Application.Interfaces;
using Job_Application.Models;
using Job_Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Job_Application.Data;

namespace Job_Application.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminRepository _repository;
        private readonly IEmployerRepository _employerRepository;
        private readonly IJobPostRepository _jobPostRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAccountActionRepository _accountActionRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IAnalyticsService _analyticsService;
        private readonly JobApplicationDbContext _context;
        private readonly IMapper _mapper;

        public AdminController(
            IAdminRepository repository,
            IEmployerRepository employerRepository,
            IJobPostRepository jobPostRepository,
            IUserRepository userRepository,
            IAccountActionRepository accountActionRepository,
            INotificationRepository notificationRepository,
            IAnalyticsService analyticsService,
            JobApplicationDbContext context,
            IMapper mapper)
        {
            _repository = repository;
            _employerRepository = employerRepository;
            _jobPostRepository = jobPostRepository;
            _userRepository = userRepository;
            _accountActionRepository = accountActionRepository;
            _notificationRepository = notificationRepository;
            _analyticsService = analyticsService;
            _context = context;
            _mapper = mapper;
        }

        // Helper method to get Admin ID from claims
        private int GetAdminId()
        {
            var adminIdClaim = User.FindFirst("AdminId")?.Value;
            return int.Parse(adminIdClaim ?? "0");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminDto>>> GetAllAdmins()
        {
            var admins = await _repository.GetAllAdmins();
            return Ok(_mapper.Map<IEnumerable<AdminDto>>(admins));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminDto>> GetAdminById(int id)
        {
            var admin = await _repository.GetAdminById(id);
            if (admin == null)
            {
                return NotFound();
            }
            return Ok(_mapper.Map<AdminDto>(admin));
        }
        [HttpPost]
        public async Task<ActionResult<AdminDto>> CreateAdmin(CreateAdminDto dto)
        {
           
            var admin = _mapper.Map<Admin>(dto);
            await _repository.CreateAdmin(admin);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdminById), new { id = admin.UserId },
                _mapper.Map<AdminDto>(admin));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmin(int id, AdminDto dto)
        {
            if (id != dto.UserId)
            {
                return BadRequest();
            }
            var admin = await _repository.GetAdminById(id);
            if (admin == null)
            {
                return NotFound();
            }
            _mapper.Map(dto, admin);
            await _repository.UpdateAdmin(admin);
            await _repository.SaveChangesAsync();

            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var admin = await _repository.GetAdminById(id);
            if (admin == null)
            {
                return NotFound();
            }
            await _repository.DeleteAdmin(admin);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        // DASHBOARD & REPORTS 
        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var stats = new DashboardStatsDto
            {
                TotalJobSeekers = await _context.JobSeekers.CountAsync(),
                TotalEmployers = await _context.Employers.CountAsync(),
                PendingEmployers = await _context.Employers.CountAsync(e => e.ApprovalStatus == EmployerApprovalStatus.Pending),
                ApprovedEmployers = await _context.Employers.CountAsync(e => e.ApprovalStatus == EmployerApprovalStatus.Approved),
                RejectedEmployers = await _context.Employers.CountAsync(e => e.ApprovalStatus == EmployerApprovalStatus.Rejected),
                TotalJobPosts = await _context.JobPosts.CountAsync(),
                ActiveJobPosts = await _context.JobPosts.CountAsync(jp => jp.Status == JobStatus.Open && !jp.IsRemoved),
                ClosedJobPosts = await _context.JobPosts.CountAsync(jp => jp.Status == JobStatus.Closed),
                RemovedJobPosts = await _context.JobPosts.CountAsync(jp => jp.IsRemoved),
                TotalApplications = await _context.JobApplications.CountAsync(),
                NewUsersLast7Days = await _context.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-7)),
                NewUsersLast30Days = await _context.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30))
            };

            return Ok(stats);
        }

        // EMPLOYER APPROVAL 
        [HttpGet("employers/pending")]
        public async Task<ActionResult<IEnumerable<EmployerApprovalDto>>> GetPendingEmployers()
        {
            var employers = await _employerRepository.GetPendingEmployers();
            var dtos = employers.Select(e => new EmployerApprovalDto
            {
                EmployerId = e.EmployerId,
                UserId = e.UserId,
                CompanyName = e.CompanyName,
                CompanyDescription = e.CompanyDescription,
                Location = e.Location,
                Website = e.Website,
                ApprovalStatus = e.ApprovalStatus,
                CreatedAt = e.User.CreatedAt,
                EmployerEmail = e.User.Email,
                EmployerFirstName = e.User.FirstName,
                EmployerLastName = e.User.LastName
            });

            return Ok(dtos);
        }

        [HttpGet("employers/approval-status/{status}")]
        public async Task<ActionResult<IEnumerable<EmployerApprovalDto>>> GetEmployersByStatus(EmployerApprovalStatus status)
        {
            var employers = await _employerRepository.GetEmployersByApprovalStatus(status);
            var dtos = employers.Select(e => new EmployerApprovalDto
            {
                EmployerId = e.EmployerId,
                UserId = e.UserId,
                CompanyName = e.CompanyName,
                CompanyDescription = e.CompanyDescription,
                Location = e.Location,
                Website = e.Website,
                ApprovalStatus = e.ApprovalStatus,
                CreatedAt = e.User.CreatedAt,
                EmployerEmail = e.User.Email,
                EmployerFirstName = e.User.FirstName,
                EmployerLastName = e.User.LastName,
                ApprovedAt = e.ApprovedAt,
                RejectedAt = e.RejectedAt,
                RejectionReason = e.RejectionReason
            });

            return Ok(dtos);
        }

        [HttpPost("employers/{employerId}/approve")]
        public async Task<IActionResult> ApproveEmployer(int employerId)
        {
            var employer = await _employerRepository.GetEmployerById(employerId);
            if (employer == null)
            {
                return NotFound(new { message = "Employer not found" });
            }

            if (employer.ApprovalStatus == EmployerApprovalStatus.Approved)
            {
                return BadRequest(new { message = "Employer is already approved" });
            }

            var adminId = GetAdminId();

            employer.ApprovalStatus = EmployerApprovalStatus.Approved;
            employer.ApprovedByAdminId = adminId;
            employer.ApprovedAt = DateTime.UtcNow;
            employer.ReviewedAt = DateTime.UtcNow;
            employer.RejectedAt = null;
            employer.RejectionReason = null;

            await _employerRepository.UpdateEmployer(employer);

            // Activate the user account
            var user = await _userRepository.GetUserById(employer.UserId);
            if (user != null)
            {
                user.IsActive = true;
                await _userRepository.UpdateUser(user);
            }

            // Log action
            await _accountActionRepository.CreateAction(new AccountAction
            {
                UserId = employer.UserId,
                ActionType = AccountActionType.EmployerApproved,
                PerformedByAdminId = adminId,
                Reason = "Employer account approved",
                ActionDate = DateTime.UtcNow
            });
            await _accountActionRepository.SaveChangesAsync();

            // Create notification for employer
            await _notificationRepository.AddNotification(new Notification
            {
                UserId = employer.UserId,
                Title = "Employer Account Approved",
                Message = $"Congratulations! Your employer account for {employer.CompanyName} has been approved. You can now post job openings.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = NotificationType.UserSpecific,
                CreatedByAdminId = adminId
            });
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "Employer approved successfully" });
        }

        [HttpPost("employers/{employerId}/reject")]
        public async Task<IActionResult> RejectEmployer(int employerId, [FromBody] RejectEmployerDto dto)
        {
            if (employerId != dto.EmployerId)
            {
                return BadRequest(new { message = "Employer ID mismatch" });
            }

            var employer = await _employerRepository.GetEmployerById(employerId);
            if (employer == null)
            {
                return NotFound(new { message = "Employer not found" });
            }

            var adminId = GetAdminId();

            employer.ApprovalStatus = EmployerApprovalStatus.Rejected;
            employer.RejectedAt = DateTime.UtcNow;
            employer.RejectionReason = dto.RejectionReason;
            employer.ReviewedAt = DateTime.UtcNow;
            employer.ApprovedAt = null;
            employer.ApprovedByAdminId = adminId;

            await _employerRepository.UpdateEmployer(employer);

            // Log action
            await _accountActionRepository.CreateAction(new AccountAction
            {
                UserId = employer.UserId,
                ActionType = AccountActionType.EmployerRejected,
                PerformedByAdminId = adminId,
                Reason = dto.RejectionReason,
                ActionDate = DateTime.UtcNow
            });
            await _accountActionRepository.SaveChangesAsync();

            // Create notification for employer
            await _notificationRepository.AddNotification(new Notification
            {
                UserId = employer.UserId,
                Title = "Employer Account Rejected",
                Message = $"Your employer account application has been rejected. Reason: {dto.RejectionReason}",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = NotificationType.UserSpecific,
                CreatedByAdminId = adminId
            });
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "Employer rejected successfully" });
        }

        //  JOB POST MODERATION 
        [HttpGet("job-posts/flagged")]
        public async Task<ActionResult<IEnumerable<JobPostModerationDto>>> GetFlaggedJobPosts()
        {
            var jobPosts = await _jobPostRepository.GetFlaggedJobPosts();
            var dtos = jobPosts.Select(jp => new JobPostModerationDto
            {
                JobPostId = jp.JobPostId,
                Title = jp.Title,
                Description = jp.Description,
                CompanyName = jp.Employer.CompanyName,
                Location = jp.Location,
                SalaryRange = jp.SalaryRange,
                IsRemoved = jp.IsRemoved,
                IsFlagged = jp.IsFlagged,
                PostedDate = jp.PostedDate,
                DeadLineDate = jp.DeadLineDate,
                Status = jp.Status,
                FlaggedAt = jp.FlaggedAt,
                EmployerId = jp.EmployerId
            });

            return Ok(dtos);
        }

        [HttpGet("job-posts/removed")]
        public async Task<ActionResult<IEnumerable<JobPostModerationDto>>> GetRemovedJobPosts()
        {
            var jobPosts = await _jobPostRepository.GetRemovedJobPosts();
            var dtos = jobPosts.Select(jp => new JobPostModerationDto
            {
                JobPostId = jp.JobPostId,
                Title = jp.Title,
                Description = jp.Description,
                CompanyName = jp.Employer.CompanyName,
                Location = jp.Location,
                SalaryRange = jp.SalaryRange,
                IsRemoved = jp.IsRemoved,
                IsFlagged = jp.IsFlagged,
                PostedDate = jp.PostedDate,
                DeadLineDate = jp.DeadLineDate,
                Status = jp.Status,
                RemovalReason = jp.RemovalReason,
                RemovedAt = jp.RemovedAt,
                EmployerId = jp.EmployerId
            });

            return Ok(dtos);
        }

        [HttpPost("job-posts/{jobPostId}/remove")]
        public async Task<IActionResult> RemoveJobPost(int jobPostId, [FromBody] RemoveJobPostDto dto)
        {
            if (jobPostId != dto.JobPostId)
            {
                return BadRequest(new { message = "Job post ID mismatch" });
            }

            var jobPost = await _jobPostRepository.GetJobPostById(jobPostId);
            if (jobPost == null)
            {
                return NotFound(new { message = "Job post not found" });
            }

            if (jobPost.IsRemoved)
            {
                return BadRequest(new { message = "Job post is already removed" });
            }

            var adminId = GetAdminId();

            jobPost.IsRemoved = true;
            jobPost.RemovedByAdminId = adminId;
            jobPost.RemovedAt = DateTime.UtcNow;
            jobPost.RemovalReason = dto.RemovalReason;

            await _jobPostRepository.UpdateJobPost(jobPost);

            // Log action
            await _accountActionRepository.CreateAction(new AccountAction
            {
                UserId = jobPost.Employer.UserId,
                ActionType = AccountActionType.JobPostRemoved,
                PerformedByAdminId = adminId,
                Reason = dto.RemovalReason,
                ActionDate = DateTime.UtcNow,
                AdditionalNotes = $"Job Post: {jobPost.Title} (ID: {jobPost.JobPostId})"
            });
            await _accountActionRepository.SaveChangesAsync();

            // Notify employer
            await _notificationRepository.AddNotification(new Notification
            {
                UserId = jobPost.Employer.UserId,
                Title = "Job Post Removed",
                Message = $"Your job post '{jobPost.Title}' has been removed. Reason: {dto.RemovalReason}",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = NotificationType.UserSpecific,
                CreatedByAdminId = adminId
            });
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "Job post removed successfully" });
        }

        [HttpPost("job-posts/{jobPostId}/restore")]
        public async Task<IActionResult> RestoreJobPost(int jobPostId)
        {
            var jobPost = await _jobPostRepository.GetJobPostById(jobPostId);
            if (jobPost == null)
            {
                return NotFound(new { message = "Job post not found" });
            }

            if (!jobPost.IsRemoved)
            {
                return BadRequest(new { message = "Job post is not removed" });
            }

            var adminId = GetAdminId();

            jobPost.IsRemoved = false;
            jobPost.RemovedByAdminId = null;
            jobPost.RemovedAt = null;
            jobPost.RemovalReason = null;

            await _jobPostRepository.UpdateJobPost(jobPost);

            // Log action
            await _accountActionRepository.CreateAction(new AccountAction
            {
                UserId = jobPost.Employer.UserId,
                ActionType = AccountActionType.JobPostRestored,
                PerformedByAdminId = adminId,
                Reason = "Job post restored by admin",
                ActionDate = DateTime.UtcNow,
                AdditionalNotes = $"Job Post: {jobPost.Title} (ID: {jobPost.JobPostId})"
            });
            await _accountActionRepository.SaveChangesAsync();

            // Notify employer
            await _notificationRepository.AddNotification(new Notification
            {
                UserId = jobPost.Employer.UserId,
                Title = "Job Post Restored",
                Message = $"Your job post '{jobPost.Title}' has been restored and is now visible again.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = NotificationType.UserSpecific,
                CreatedByAdminId = adminId
            });
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "Job post restored successfully" });
        }

        [HttpPost("job-posts/{jobPostId}/flag")]
        public async Task<IActionResult> FlagJobPost(int jobPostId)
        {
            var jobPost = await _jobPostRepository.GetJobPostById(jobPostId);
            if (jobPost == null)
            {
                return NotFound(new { message = "Job post not found" });
            }

            if (jobPost.IsFlagged)
            {
                return BadRequest(new { message = "Job post is already flagged" });
            }

            jobPost.IsFlagged = true;
            jobPost.FlaggedAt = DateTime.UtcNow;

            await _jobPostRepository.UpdateJobPost(jobPost);

            return Ok(new { message = "Job post flagged successfully" });
        }

        [HttpPost("job-posts/{jobPostId}/unflag")]
        public async Task<IActionResult> UnflagJobPost(int jobPostId)
        {
            var jobPost = await _jobPostRepository.GetJobPostById(jobPostId);
            if (jobPost == null)
            {
                return NotFound(new { message = "Job post not found" });
            }

            if (!jobPost.IsFlagged)
            {
                return BadRequest(new { message = "Job post is not flagged" });
            }

            jobPost.IsFlagged = false;
            jobPost.FlaggedAt = null;

            await _jobPostRepository.UpdateJobPost(jobPost);

            return Ok(new { message = "Job post unflagged successfully" });
        }

        //  USER ACCOUNT MANAGEMENT 
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserManagementDto>>> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsers();
            var dtos = users.Select(u => new UserManagementDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                FullName = $"{u.FirstName} {u.LastName}",
                UserRole = u.UserRole,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                DeactivatedAt = u.DeactivatedAt,
                DeactivationReason = u.DeactivationReason
            });

            return Ok(dtos);
        }

        [HttpPost("users/{userId}/deactivate")]
        public async Task<IActionResult> DeactivateUser(int userId, [FromBody] DeactivateAccountDto dto)
        {
            if (userId != dto.UserId)
            {
                return BadRequest(new { message = "User ID mismatch" });
            }

            var user = await _userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (!user.IsActive)
            {
                return BadRequest(new { message = "User is already deactivated" });
            }

            var adminId = GetAdminId();

            user.IsActive = false;
            user.DeactivatedAt = DateTime.UtcNow;
            user.DeactivatedByAdminId = adminId;
            user.DeactivationReason = dto.Reason;

            await _userRepository.UpdateUser(user);

            // Log action
            await _accountActionRepository.CreateAction(new AccountAction
            {
                UserId = userId,
                ActionType = AccountActionType.Deactivated,
                PerformedByAdminId = adminId,
                Reason = dto.Reason,
                ActionDate = DateTime.UtcNow
            });
            await _accountActionRepository.SaveChangesAsync();

            // Notify user
            await _notificationRepository.AddNotification(new Notification
            {
                UserId = userId,
                Title = "Account Deactivated",
                Message = $"Your account has been deactivated. Reason: {dto.Reason}. Please contact support for assistance.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = NotificationType.UserSpecific,
                CreatedByAdminId = adminId
            });
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "User deactivated successfully" });
        }

        [HttpPost("users/{userId}/reactivate")]
        public async Task<IActionResult> ReactivateUser(int userId)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.IsActive)
            {
                return BadRequest(new { message = "User is already active" });
            }

            var adminId = GetAdminId();

            user.IsActive = true;
            user.DeactivatedAt = null;
            user.DeactivatedByAdminId = null;
            user.DeactivationReason = null;

            await _userRepository.UpdateUser(user);

            // Log action
            await _accountActionRepository.CreateAction(new AccountAction
            {
                UserId = userId,
                ActionType = AccountActionType.Reactivated,
                PerformedByAdminId = adminId,
                Reason = "Account reactivated by admin",
                ActionDate = DateTime.UtcNow
            });
            await _accountActionRepository.SaveChangesAsync();

            // Notify user
            await _notificationRepository.AddNotification(new Notification
            {
                UserId = userId,
                Title = "Account Reactivated",
                Message = "Your account has been reactivated. You can now log in and use the platform.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                NotificationType = NotificationType.UserSpecific,
                CreatedByAdminId = adminId
            });
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "User reactivated successfully" });
        }

        [HttpGet("users/{userId}/actions")]
        public async Task<ActionResult<IEnumerable<AccountAction>>> GetUserActions(int userId)
        {
            var actions = await _accountActionRepository.GetActionsByUserId(userId);
            return Ok(actions);
        }

        // NOTIFICATION MANAGEMENT

        // Create a system-wide notification sent to all active users
        [HttpPost("notifications/system")]
        public async Task<IActionResult> CreateSystemNotification([FromBody] CreateSystemNotificationDto dto)
        {
            try
            {
                await _notificationRepository.CreateSystemNotification(
                    dto.Title,
                    dto.Message,
                    dto.Type
                );

                return Ok(new { message = "System notification created and sent to all users" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating system notification", error = ex.Message });
            }
        }
        // Create a role-specific notification sent to all users of a specific role
        [HttpPost("notifications/role")]
        public async Task<IActionResult> CreateRoleNotification([FromBody] CreateRoleNotificationDto dto)
        {
            try
            {
                await _notificationRepository.CreateRoleNotification(
                    dto.Title,
                    dto.Message,
                    dto.Type,
                    dto.TargetRole
                );

                return Ok(new { message = $"Role notification created and sent to all {dto.TargetRole} users" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating role notification", error = ex.Message });
            }
        }

        // Create a user-specific notification sent to a single user
        [HttpPost("notifications/user")]
        public async Task<IActionResult> CreateUserNotification([FromBody] CreateUserNotificationDto dto)
        {
            try
            {
                await _notificationRepository.CreateUserNotification(
                    dto.Title,
                    dto.Message,
                    dto.Type,
                    dto.UserId
                );

                return Ok(new { message = $"Notification created and sent to user {dto.UserId}" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating user notification", error = ex.Message });
            }
        }

        //Get all notifications in the system
        [HttpGet("notifications")]
        public async Task<ActionResult<IEnumerable<NotificationResponseDto>>> GetAllNotifications()
        {
            try
            {
                var notifications = await _notificationRepository.GetAllNotifications();
                var notificationDtos = _mapper.Map<IEnumerable<NotificationResponseDto>>(notifications);
                return Ok(notificationDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching notifications", error = ex.Message });
            }
        }

        // Get all notifications for a specific role
        [HttpGet("notifications/role/{role}")]
        public async Task<ActionResult<IEnumerable<NotificationResponseDto>>> GetNotificationsByRole(string role)
        {
            try
            {
                var notifications = await _notificationRepository.GetNotificationsByRole(role);
                var notificationDtos = _mapper.Map<IEnumerable<NotificationResponseDto>>(notifications);
                return Ok(notificationDtos);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching notifications", error = ex.Message });
            }
        }

        // ANALYTICS & REPORTS

        //Get application trends and statistics
        [HttpGet("analytics/application-trends")]
        public async Task<ActionResult<ApplicationTrendsDto>> GetApplicationTrends(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var trends = await _analyticsService.GetApplicationTrends(startDate, endDate);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching application trends", error = ex.Message });
            }
        }

        // Get user growth statistics
        [HttpGet("analytics/user-growth")]
        public async Task<ActionResult<UserGrowthDto>> GetUserGrowth(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var growth = await _analyticsService.GetUserGrowth(startDate, endDate);
                return Ok(growth);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching user growth", error = ex.Message });
            }
        }

        // Get job post analytics
        [HttpGet("analytics/job-posts")]
        public async Task<ActionResult<JobPostAnalyticsDto>> GetJobPostAnalytics(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var analytics = await _analyticsService.GetJobPostAnalytics(startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching job post analytics", error = ex.Message });
            }
        }

        //Get employer analytics
        [HttpGet("analytics/employers")]
        public async Task<ActionResult<EmployerAnalyticsDto>> GetEmployerAnalytics(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var analytics = await _analyticsService.GetEmployerAnalytics(startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching employer analytics", error = ex.Message });
            }
        }

        //Get comprehensive system overview
        [HttpGet("analytics/system-overview")]
        public async Task<ActionResult<SystemOverviewDto>> GetSystemOverview(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var overview = await _analyticsService.GetSystemOverview(startDate, endDate);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching system overview", error = ex.Message });
            }
        }
    }
}
