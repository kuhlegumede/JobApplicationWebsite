namespace Job_Application.Dto
{
    public class AssessmentDto
    {
        public int AssessmentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int EmployerId { get; set; }
        public string? EmployerName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public List<AssessmentQuestionDto>? Questions { get; set; }
    }

    public class AssessmentQuestionDto
    {
        public int QuestionId { get; set; }
        public int AssessmentId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string Type { get; set; } = "Text";
        public List<string>? Options { get; set; }
    }

    public class CreateAssessmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<CreateAssessmentQuestionDto> Questions { get; set; } = new();
        public List<int>? JobSeekerIds { get; set; }
    }

    public class CreateAssessmentQuestionDto
    {
        public string QuestionText { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string Type { get; set; } = "Text";
        public List<string>? Options { get; set; }
    }

    // Assignment DTOs for Job Seeker
    public class AssessmentAssignmentDto
    {
        public int AssignmentId { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentTitle { get; set; } = string.Empty;
        public string? AssessmentDescription { get; set; }
        public string EmployerName { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime AssignedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? Score { get; set; }
        public List<AssessmentQuestionDto>? Questions { get; set; }
        public Dictionary<int, string>? SubmittedResponses { get; set; }
    }

    // For submitting assessment answers
    public class SubmitAssessmentDto
    {
        public Dictionary<int, string> Responses { get; set; } = new();
    }

    // For employer viewing submissions
    public class AssessmentResponseDto
    {
        public int AssignmentId { get; set; }
        public int JobSeekerId { get; set; }
        public string JobSeekerName { get; set; } = string.Empty;
        public string JobSeekerEmail { get; set; } = string.Empty;
        public string AssessmentTitle { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime AssignedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? Score { get; set; }
        public List<QuestionResponseDto>? Responses { get; set; }
    }

    // Individual question response
    public class QuestionResponseDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = "Text";
        public string? Answer { get; set; }
        public int OrderIndex { get; set; }
        public List<string>? Options { get; set; }
    }

    // For updating score
    public class UpdateScoreDto
    {
        public int Score { get; set; }
    }
}
