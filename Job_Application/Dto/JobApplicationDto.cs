using Job_Application.Models;
using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class JobApplicationDto
    {
        public int JobApplicationId {  get; set; }
        public int JobSeekerId {  get; set; }
        public int JobPostId {  get; set; }

        [Required(ErrorMessage = "Resume is required.")]
        [StringLength(500, ErrorMessage = "Resume URL cannot exceed 500 characters.")]
        public string Resume {  get; set; }
        public bool SameResumeUsed { get; set; }

        [StringLength(1000, ErrorMessage = "Cover Letter cannot exceed 1000 characters.")]
        public string CoverLetter {  get; set; }
        public string DateApplied {  get; set; }
        public ApplicationStatus ApplicationStatus { get; set; }
        public DateTime LastUpdated { get; set; }

        public JobPostDto JobPost { get; set; }
        public JobSeekerDto JobSeeker { get; set; }
        public InterviewScheduleDto InterviewSchedule { get; set; }
    }
}
