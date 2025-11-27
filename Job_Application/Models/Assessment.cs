using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Job_Application.Models
{
    public class Assessment
    {
        [Key]
        public int AssessmentId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int EmployerId { get; set; }

        [ForeignKey("EmployerId")]
        public Employer? Employer { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation property
        public ICollection<AssessmentQuestion>? Questions { get; set; }
        public ICollection<AssessmentAssignment>? Assignments { get; set; }
    }

    public class AssessmentQuestion
    {
        [Key]
        public int QuestionId { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [ForeignKey("AssessmentId")]
        public Assessment? Assessment { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        public int OrderIndex { get; set; }

        public QuestionType Type { get; set; } = QuestionType.Text;

        // For multiple choice questions (JSON array of options)
        public string? Options { get; set; }
    }

    public class AssessmentAssignment
    {
        [Key]
        public int AssignmentId { get; set; }

        [Required]
        public int AssessmentId { get; set; }

        [ForeignKey("AssessmentId")]
        public Assessment? Assessment { get; set; }

        [Required]
        public int JobSeekerId { get; set; }

        [ForeignKey("JobSeekerId")]
        public JobSeeker? JobSeeker { get; set; }

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        public AssessmentStatus Status { get; set; } = AssessmentStatus.Pending;

        // Store the responses as JSON
        public string? Responses { get; set; }

        public int? Score { get; set; }
    }

    public enum AssessmentStatus
    {
        Pending,
        InProgress,
        Completed,
        Reviewed
    }

    public enum QuestionType
    {
        Text,
        MultipleChoice,
        YesNo
    }
}
