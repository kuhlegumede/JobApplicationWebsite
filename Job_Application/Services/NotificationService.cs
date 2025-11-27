using Job_Application.Interfaces;
using Job_Application.Models;

namespace Job_Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _logger = logger;
        }

        public async Task CreateNotification(
            int userId, 
            string title, 
            string message, 
            int? relatedEntityId = null,
            string notificationType = "General")
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddNotification(notification);
                
                _logger.LogInformation(
                    "Notification created for user {UserId}: {Title}", 
                    userId, 
                    title
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex, 
                    "Error creating notification for user {UserId}", 
                    userId
                );
                throw;
            }
        }

        public async Task NotifyMultipleUsers(
            List<int> userIds, 
            string title, 
            string message, 
            string notificationType = "General")
        {
            try
            {
                var tasks = new List<Task>();

                foreach (var userId in userIds)
                {
                    tasks.Add(CreateNotification(
                        userId, 
                        title, 
                        message, 
                        null, 
                        notificationType
                    ));
                }

                await Task.WhenAll(tasks);

                _logger.LogInformation(
                    "Notifications sent to {Count} users: {Title}", 
                    userIds.Count, 
                    title
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex, 
                    "Error notifying multiple users"
                );
                throw;
            }
        }
    }
}
