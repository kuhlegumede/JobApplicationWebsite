using Job_Application.Models;

namespace Job_Application.Dto
{
    public class JobPostModerationDto
    {
        public int JobPostId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string CompanyName { get; set; }
        public string Location { get; set; }
        public string SalaryRange { get; set; }
        public bool IsRemoved { get; set; }
        public bool IsFlagged { get; set; }
        public DateTime PostedDate { get; set; }
        public DateTime DeadLineDate { get; set; }
        public JobStatus Status { get; set; }
        public string RemovalReason { get; set; }
        public DateTime? RemovedAt { get; set; }
        public DateTime? FlaggedAt { get; set; }
        public int EmployerId { get; set; }
    }
}
