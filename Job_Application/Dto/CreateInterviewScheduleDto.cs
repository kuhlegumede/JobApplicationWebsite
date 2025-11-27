using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateInterviewScheduleDto
    {
        [Required(ErrorMessage = "Job Application ID is required.")]
        public int JobApplicationId { get; set; }

        [Required(ErrorMessage = "Schedule date is required.")]
        public DateTime ScheduleDate { get; set; }

        [Required(ErrorMessage = "Interview mode is required (e.g., InPerson, Online, Phone).")]
        public string InterviewMode { get; set; }

        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters.")]
        public string Notes { get; set; }
    }
}
