using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            INotificationRepository notificationRepository,
            ILogger<NotificationController> logger)
        {
            _notificationRepository = notificationRepository;
            _logger = logger;
        }

        // GET: api/Notification
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetAllNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationRepository.GetJobNotifications(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notifications for user {UserId}", GetCurrentUserId());
                return StatusCode(500, "An error occurred while fetching notifications");
            }
        }

        // GET: api/Notification/unread
        [HttpGet("unread")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _notificationRepository.GetUnreadCount(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching unread count for user {UserId}", GetCurrentUserId());
                return StatusCode(500, "An error occurred while fetching unread count");
            }
        }

        // GET: api/Notification/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotificationById(int id)
        {
            try
            {
                var notification = await _notificationRepository.GetNotificationById(id);
                
                if (notification == null)
                {
                    return NotFound("Notification not found");
                }

                // Verify the notification belongs to the current user
                if (notification.UserId != GetCurrentUserId())
                {
                    return Forbid("Access denied");
                }

                return Ok(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notification {NotificationId}", id);
                return StatusCode(500, "An error occurred while fetching the notification");
            }
        }

        // PUT: api/Notification/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var notification = await _notificationRepository.GetNotificationById(id);
                
                if (notification == null)
                {
                    return NotFound("Notification not found");
                }

                // Verify the notification belongs to the current user
                if (notification.UserId != GetCurrentUserId())
                {
                    return Forbid("Access denied");
                }

                await _notificationRepository.MarkAsRead(id);
                return Ok(new { message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", id);
                return StatusCode(500, "An error occurred while updating the notification");
            }
        }

        // PUT: api/Notification/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationRepository.MarkAllAsRead(userId);
                return Ok(new { message = "All notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", GetCurrentUserId());
                return StatusCode(500, "An error occurred while updating notifications");
            }
        }

        // DELETE: api/Notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var notification = await _notificationRepository.GetNotificationById(id);
                
                if (notification == null)
                {
                    return NotFound("Notification not found");
                }

                // Verify the notification belongs to the current user
                if (notification.UserId != GetCurrentUserId())
                {
                    return Forbid("Access denied");
                }

                await _notificationRepository.DeleteNotification(id);
                return Ok(new { message = "Notification deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", id);
                return StatusCode(500, "An error occurred while deleting the notification");
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
