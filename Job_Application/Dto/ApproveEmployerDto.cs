using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class ApproveEmployerDto
    {
        [Required]
        public int EmployerId { get; set; }
    }
}
