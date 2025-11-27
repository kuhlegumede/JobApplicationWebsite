namespace Job_Application.Dto
{
    public class ApplicationTrendsDto
    {
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ReviewedApplications { get; set; }
        public int AcceptedApplications { get; set; }
        public int RejectedApplications { get; set; }
        public Dictionary<string, int> ApplicationsByMonth { get; set; } = new();
        public Dictionary<string, int> ApplicationsByStatus { get; set; } = new();
        public double AverageApplicationsPerJob { get; set; }
        public List<TopJobPostDto> MostAppliedJobs { get; set; } = new();
    }

    public class TopJobPostDto
    {
        public int JobPostId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public int ApplicationCount { get; set; }
    }
}
