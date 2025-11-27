using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Job_Application.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly JobApplicationDbContext _context;

        public NotificationRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Notification>> GetJobNotifications(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Notification> GetNotificationById(int notificationId)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);
        }

        public async Task<int> GetUnreadCount(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();
        }

        public async Task AddNotification(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
            await SaveChangesAsync();
        }

        public async Task MarkAsRead(int notificationId)
        {
            var notification = await GetNotificationById(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                _context.Notifications.Update(notification);
                await SaveChangesAsync();
            }
        }

        public async Task MarkAllAsRead(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await SaveChangesAsync();
        }

        public async Task DeleteNotification(int notificationId)
        {
            var notification = await GetNotificationById(notificationId);
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await SaveChangesAsync();
            }
        }

        public async Task CreateSystemNotification(string title, string message, string type)
        {
            // Parse notification type
            if (!Enum.TryParse<NotificationType>(type, out var notificationType))
            {
                notificationType = NotificationType.SystemWide;
            }

            // Get all users
            var users = await _context.Users
                .Where(u => u.IsActive)
                .ToListAsync();

            // Create notification for each user
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.UserId,
                    Title = title,
                    Message = message,
                    NotificationType = notificationType,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Notifications.AddAsync(notification);
            }

            await SaveChangesAsync();
        }

        public async Task CreateRoleNotification(string title, string message, string type, string targetRole)
        {
            // Parse notification type and user role
            if (!Enum.TryParse<NotificationType>(type, out var notificationType))
            {
                notificationType = NotificationType.RoleSpecific;
            }

            if (!Enum.TryParse<UserRole>(targetRole, out var userRole))
            {
                throw new ArgumentException("Invalid role specified");
            }

            // Get users with the specified role
            var users = await _context.Users
                .Where(u => u.IsActive && u.UserRole == userRole)
                .ToListAsync();

            // Create notification for each user in the role
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.UserId,
                    Title = title,
                    Message = message,
                    NotificationType = notificationType,
                    TargetRole = userRole,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Notifications.AddAsync(notification);
            }

            await SaveChangesAsync();
        }

        public async Task CreateUserNotification(string title, string message, string type, int userId)
        {
            // Parse notification type
            if (!Enum.TryParse<NotificationType>(type, out var notificationType))
            {
                notificationType = NotificationType.UserSpecific;
            }

            // Verify user exists and is active
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
            {
                throw new ArgumentException("User not found or inactive");
            }

            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                NotificationType = notificationType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification);
            await SaveChangesAsync();
        }

        public async Task<IEnumerable<Notification>> GetAllNotifications()
        {
            return await _context.Notifications
                .Include(n => n.User)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByRole(string role)
        {
            if (!Enum.TryParse<UserRole>(role, out var userRole))
            {
                throw new ArgumentException("Invalid role specified");
            }

            return await _context.Notifications
                .Include(n => n.User)
                .Where(n => n.User.UserRole == userRole)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
