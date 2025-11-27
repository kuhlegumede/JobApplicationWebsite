using Job_Application.Models;
using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class UpdateFaqDto
    {
        [Required]
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

        public bool IsPublished { get; set; }
    }
}
