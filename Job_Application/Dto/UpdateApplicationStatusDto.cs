using Job_Application.Models;
using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class UpdateApplicationStatusDto
    {
        [Required(ErrorMessage = "Application status is required.")]
        public ApplicationStatus ApplicationStatus { get; set; }
    }
}
