using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateJobPostDto
    {
        public int EmployerId { get; set; }

        [Required(ErrorMessage = "Job title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Job description is required.")]
        [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
        public string Description { get; set; }

        [StringLength(1000, ErrorMessage = "Requirements cannot exceed 1000 characters.")]
        public string Requirements { get; set; }

        [StringLength(100, ErrorMessage = "Salary range cannot exceed 100 characters.")]
        public string SalaryRange { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(300, ErrorMessage = "Location cannot exceed 300 characters.")]
        public string Location { get; set; }

        [Required(ErrorMessage = "Deadline date is required.")]
        public DateTime DeadLineDate { get; set; }

    }
}
