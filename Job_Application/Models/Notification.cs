using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Job_Application.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public int UserId { get; set; }  // FK to User

        [Required]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Admin Notification Management Fields
        public NotificationType NotificationType { get; set; } = NotificationType.UserSpecific;

        public UserRole? TargetRole { get; set; }  // For role-specific notifications

        public int? CreatedByAdminId { get; set; }  // FK to Admin

        [ForeignKey("UserId")]
        public User User { get; set; }  // Navigation property
    }
}
