using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class RemoveJobPostDto
    {
        [Required]
        public int JobPostId { get; set; }

        [Required(ErrorMessage = "Removal reason is required.")]
        [StringLength(1000, ErrorMessage = "Removal reason cannot exceed 1000 characters.")]
        public string RemovalReason { get; set; }
    }
}
