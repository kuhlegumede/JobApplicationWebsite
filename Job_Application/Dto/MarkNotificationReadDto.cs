using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class MarkNotificationReadDto
    {
        [Required(ErrorMessage = "Notification ID is required")]
        public int NotificationId { get; set; }
    }
}
