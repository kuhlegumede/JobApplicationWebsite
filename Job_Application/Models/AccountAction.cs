using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Job_Application.Models
{
    public class AccountAction
    {
        [Key]
        public int ActionId { get; set; }

        [Required]
        public int UserId { get; set; }  // FK to User

        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public AccountActionType ActionType { get; set; }

        [Required]
        public int PerformedByAdminId { get; set; }  // FK to Admin

        [ForeignKey("PerformedByAdminId")]
        public Admin PerformedBy { get; set; }

        [StringLength(1000, ErrorMessage = "Reason cannot exceed 1000 characters.")]
        public string Reason { get; set; }

        public DateTime ActionDate { get; set; } = DateTime.UtcNow;

        [StringLength(2000, ErrorMessage = "Additional notes cannot exceed 2000 characters.")]
        public string AdditionalNotes { get; set; }
    }
}
