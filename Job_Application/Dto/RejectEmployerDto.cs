using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class RejectEmployerDto
    {
        [Required]
        public int EmployerId { get; set; }

        [Required(ErrorMessage = "Rejection reason is required.")]
        [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters.")]
        public string RejectionReason { get; set; }
    }
}
