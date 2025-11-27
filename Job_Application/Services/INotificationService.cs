using Job_Application.Models;

namespace Job_Application.Services
{
    public interface INotificationService
    {

        // Create a notification for a specific user
        Task CreateNotification(
            int userId, 
            string title, 
            string message, 
            int? relatedEntityId = null,
            string notificationType = "General"
        );

        //Send notifications to multiple users

        Task NotifyMultipleUsers(
            List<int> userIds, 
            string title, 
            string message, 
            string notificationType = "General"
        );
    }
}
