using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Job_Application.Models
{
    public class FAQ
    {
        [Key]
        public int FaqId { get; set; }

        [Required(ErrorMessage = "Question is required.")]
        [StringLength(500, ErrorMessage = "Question cannot exceed 500 characters.")]
        public string Question { get; set; }

        [Required(ErrorMessage = "Answer is required.")]
        [StringLength(5000, ErrorMessage = "Answer cannot exceed 5000 characters.")]
        public string Answer { get; set; }

        [Required]
        public FaqCategory Category { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        public int CreatedByAdminId { get; set; }  // FK to Admin

        [ForeignKey("CreatedByAdminId")]
        public Admin CreatedBy { get; set; }
    }
}
