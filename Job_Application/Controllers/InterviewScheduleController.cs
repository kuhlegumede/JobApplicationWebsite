using AutoMapper;
using Job_Application.Dto;
using Job_Application.Hubs;
using Job_Application.Interfaces;
using Job_Application.Models;
using Job_Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewScheduleController : ControllerBase
    {
        private readonly IInterviewScheduleRepository _repository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly InterviewReminderService _interviewReminderService;

        public InterviewScheduleController(
            IInterviewScheduleRepository repository,
            INotificationRepository notificationRepository,
            IMapper mapper,
            IHubContext<ChatHub> hubContext, 
            InterviewReminderService interviewReminderService)
        {
            _repository = repository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _hubContext = hubContext;
            _interviewReminderService = interviewReminderService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InterviewScheduleDto>>> GetAllSchedules()
        {
            var schedules = await _repository.GetAllSchedules();
            return Ok(_mapper.Map<IEnumerable<InterviewScheduleDto>>(schedules));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InterviewScheduleDto>> GetScheduleById(int id)
        {
            var schedule = await _repository.GetScheduleById(id);
            if (schedule == null)
                return NotFound();

            return Ok(_mapper.Map<InterviewScheduleDto>(schedule));
        }

        // GET: api/InterviewSchedule/jobseeker/{jobSeekerId}
        [HttpGet("jobseeker/{jobSeekerId}")]
        [Authorize(Roles = "JobSeeker, Admin")]
        public async Task<ActionResult<IEnumerable<InterviewScheduleDto>>> GetSchedulesByJobSeeker(int jobSeekerId)
        {
            var schedules = await _repository.GetSchedulesByJobSeekerId(jobSeekerId);
            return Ok(_mapper.Map<IEnumerable<InterviewScheduleDto>>(schedules));
        }
        [Authorize(Roles = "Admin, Employer")]
        [HttpPost]
        public async Task<ActionResult<InterviewScheduleDto>> CreateSchedule(CreateInterviewScheduleDto dto)
        {
            // Check if interview already exists for this application
            var existingSchedule = await _repository.GetScheduleByApplicationId(dto.JobApplicationId);
            if (existingSchedule != null)
            {
                return Conflict(new { message = "An interview has already been scheduled for this application. Please update the existing interview instead." });
            }

            var schedule = _mapper.Map<InterviewSchedule>(dto);
            await _repository.CreateSchedule(schedule);
            await _repository.SaveChangesAsync();

            // Fetch the schedule with navigation properties to get job seeker info
            var scheduleWithDetails = await _repository.GetScheduleById(schedule.InterviewId);

            if (scheduleWithDetails?.JobApplication?.JobSeeker?.User != null)
            {
                var jobSeekerUserId = scheduleWithDetails.JobApplication.JobSeeker.UserId;
                var jobTitle = scheduleWithDetails.JobApplication.JobPost?.Title ?? "a position";
                
                // Create notification for job seeker
                var notification = new Notification
                {
                    UserId = jobSeekerUserId,
                    Title = "Interview Scheduled",
                    Message = $"You have been scheduled for an interview for {jobTitle} on {schedule.ScheduleDate:MMMM dd, yyyy} at {schedule.ScheduleDate:h:mm tt}. Mode: {schedule.Mode}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddNotification(notification);

                // Send real-time notification via SignalR
                await _hubContext.Clients.User(jobSeekerUserId.ToString())
                    .SendAsync("ReceiveNotification", notification);
            }

            // Send live notification via SignalR (keep existing for backward compatibility)
            await _hubContext.Clients.All.SendAsync("InterviewScheduled", new
            {
                schedule.InterviewId,
                schedule.JobApplicationId,
                schedule.ScheduleDate,
                schedule.Mode,
                schedule.Notes
            });
            
            await _interviewReminderService.SendInterviewReminderAsync(schedule);

            return CreatedAtAction(nameof(GetScheduleById),
                new { id = schedule.InterviewId },
                _mapper.Map<InterviewScheduleDto>(schedule));
        }
        [Authorize(Roles = "Admin, Employer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSchedule(int id, InterviewScheduleDto dto)
        {
            var schedule = await _repository.GetScheduleById(id);
            if (schedule == null)
                return NotFound();

            _mapper.Map(dto, schedule);
            await _repository.UpdateSchedule(schedule);
            await _repository.SaveChangesAsync();

            // Create notification for job seeker about interview update
            if (schedule?.JobApplication?.JobSeeker?.User != null)
            {
                var jobSeekerUserId = schedule.JobApplication.JobSeeker.UserId;
                var jobTitle = schedule.JobApplication.JobPost?.Title ?? "a position";
                
                var notification = new Notification
                {
                    UserId = jobSeekerUserId,
                    Title = "Interview Updated",
                    Message = $"Your interview for {jobTitle} has been rescheduled to {schedule.ScheduleDate:MMMM dd, yyyy} at {schedule.ScheduleDate:h:mm tt}. Mode: {schedule.Mode}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddNotification(notification);

                // Send real-time notification
                await _hubContext.Clients.User(jobSeekerUserId.ToString())
                    .SendAsync("ReceiveNotification", notification);
            }

            // Notify via SignalR that the interview was updated (keep for backward compatibility)
            await _hubContext.Clients.All.SendAsync("InterviewUpdated", new
            {
                schedule.InterviewId,
                schedule.ScheduleDate,
                schedule.Mode,
                schedule.Notes
            });
            
            await _interviewReminderService.SendInterviewReminderAsync(schedule);

            return NoContent();
        }
        [Authorize(Roles = "Admin, Employer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _repository.GetScheduleById(id);
            if (schedule == null)
                return NotFound();

            // Create notification for job seeker about interview cancellation
            if (schedule?.JobApplication?.JobSeeker?.User != null)
            {
                var jobSeekerUserId = schedule.JobApplication.JobSeeker.UserId;
                var jobTitle = schedule.JobApplication.JobPost?.Title ?? "a position";
                
                var notification = new Notification
                {
                    UserId = jobSeekerUserId,
                    Title = "Interview Cancelled",
                    Message = $"Your interview for {jobTitle} scheduled on {schedule.ScheduleDate:MMMM dd, yyyy} at {schedule.ScheduleDate:h:mm tt} has been cancelled.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddNotification(notification);

                // Send real-time notification
                await _hubContext.Clients.User(jobSeekerUserId.ToString())
                    .SendAsync("ReceiveNotification", notification);
            }

            await _repository.DeleteSchedule(schedule);
            await _repository.SaveChangesAsync();

            // Notify clients about deletion (keep for backward compatibility)
            await _hubContext.Clients.All.SendAsync("InterviewDeleted", id);

            return NoContent();
        }
    }
}
