using AutoMapper;
using Job_Application.Dto;
using Job_Application.Hubs;
using Job_Application.Interfaces;
using Job_Application.Models;
using Job_Application.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class JobPostController : ControllerBase
    {
        private readonly IJobPostRepository _repository;
        private readonly INotificationRepository _notificationRepository; 
        private readonly IMapper _mapper;
        private readonly IHubContext<ChatHub> _hubContext; 

        public JobPostController(
            IJobPostRepository repository,
            INotificationRepository notificationRepository,
            IMapper mapper,
            IHubContext<ChatHub> hubContext)
        {
            _repository = repository;
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobPostDto>>> GetAllJobPosts()
        {
            var posts = await _repository.GetAllJobPosts();
            
            // Filter out removed posts for non-admin users
            if (!User.IsInRole("Admin"))
            {
                posts = posts.Where(p => !p.IsRemoved).ToList();
            }
            
            return Ok(_mapper.Map<IEnumerable<JobPostDto>>(posts));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobPostDto>> GetJobPostById(int id)
        {
            var post = await _repository.GetJobPostById(id);
            if (post == null) return NotFound();
            
            // Don't show removed posts to non-admin users
            if (post.IsRemoved && !User.IsInRole("Admin"))
            {
                return NotFound();
            }
            
            return Ok(_mapper.Map<JobPostDto>(post));
        }
        [Authorize(Roles = "Admin, Employer")]
        [RequireApprovedEmployer]
        [HttpPost]
        public async Task<ActionResult<JobPostDto>> CreateJobPost(CreateJobPostDto dto)
        {
            var post = _mapper.Map<JobPost>(dto);
            post.PostedDate = DateTime.UtcNow;
            post.Status = JobStatus.Open;

            await _repository.CreateJobPost(post);

            var relevantSeekers = await _repository.GetRelevantJobSeekersAsync(post);

            foreach (var seeker in relevantSeekers)
            {
                // Create notification in DB
                var notification = new Notification
                {
                    UserId = seeker.UserId,
                    Title = "New Job Posted",
                    Message = $"A new job '{post.Title}' matches your profile!",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _notificationRepository.AddNotification(notification);

                // Send real-time notification via SignalR
                await _hubContext.Clients.Group(seeker.UserId.ToString())
                    .SendAsync("ReceiveNotification", new
                    {
                        notification.Title,
                        notification.Message,
                        notification.CreatedAt
                    });
            }

            await _notificationRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJobPostById), new { id = post.JobPostId },
                  _mapper.Map<JobPostDto>(post));
        }
        [Authorize(Roles = "Admin, Employer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJobPost(int id, JobPostDto dto)
        {
            var post = await _repository.GetJobPostById(id);
            if (post == null) return NotFound();

            _mapper.Map(dto, post);
            await _repository.UpdateJobPost(post);
            await _repository.SaveChangesAsync();

            return NoContent();
        }
        [Authorize(Roles = "Admin, Employer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobPost(int id)
        {
            var post = await _repository.GetJobPostById(id);
            if (post == null) return NotFound();

            await _repository.DeleteJobPost(post);
            await _repository.SaveChangesAsync();

            return NoContent();
        }
    }
}
