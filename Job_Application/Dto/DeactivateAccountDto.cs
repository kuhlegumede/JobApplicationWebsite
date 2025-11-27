using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class DeactivateAccountDto
    {
        [Required]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Reason is required.")]
        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters.")]
        public string Reason { get; set; }
    }
}
