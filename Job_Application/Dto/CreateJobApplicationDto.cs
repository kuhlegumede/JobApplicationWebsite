using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateJobApplicationDto
    {
        public int JobSeekerId {  get; set; }
        public int JobPostId { get; set; }

        [Required(ErrorMessage = "Resume is required.")]
        [StringLength(500, ErrorMessage = "Resume URL cannot exceed 500 characters.")]
        public string Resume {  get; set; }

        [StringLength(1000, ErrorMessage = "Cover Letter cannot exceed 1000 characters.")]
        public string CoverLetter {  get; set; }
    }
}
