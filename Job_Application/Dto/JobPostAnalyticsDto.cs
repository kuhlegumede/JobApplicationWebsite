namespace Job_Application.Dto
{
    public class JobPostAnalyticsDto
    {
        public int TotalJobPosts { get; set; }
        public int ActiveJobPosts { get; set; }
        public int ClosedJobPosts { get; set; }
        public int RemovedJobPosts { get; set; }
        public int FlaggedJobPosts { get; set; }
        public Dictionary<string, int> JobPostsByMonth { get; set; } = new();
        public Dictionary<string, int> JobPostsByStatus { get; set; } = new();
        public List<EmployerJobPostStatsDto> TopEmployers { get; set; } = new();
        public double AverageJobDuration { get; set; } // Days
    }

    public class EmployerJobPostStatsDto
    {
        public int EmployerId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public int TotalJobPosts { get; set; }
        public int ActiveJobPosts { get; set; }
        public int TotalApplications { get; set; }
    }
}
