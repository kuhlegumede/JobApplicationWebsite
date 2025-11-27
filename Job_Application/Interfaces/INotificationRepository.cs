using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Job_Application.Interfaces
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetJobNotifications(int userId);
        Task<Notification> GetNotificationById(int notificationId);
        Task<int> GetUnreadCount(int userId);
        Task AddNotification(Notification notification);
        Task MarkAsRead(int notificationId);
        Task MarkAllAsRead(int userId);
        Task DeleteNotification(int notificationId);
        Task SaveChangesAsync();

        // Admin notification methods
        Task CreateSystemNotification(string title, string message, string type);
        Task CreateRoleNotification(string title, string message, string type, string targetRole);
        Task CreateUserNotification(string title, string message, string type, int userId);
        Task<IEnumerable<Notification>> GetAllNotifications();
        Task<IEnumerable<Notification>> GetNotificationsByRole(string role);
    }
}
