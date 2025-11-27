namespace Job_Application.Dto
{
    public class SystemOverviewDto
    {
        public DateTime GeneratedAt { get; set; }
        public string DateRange { get; set; } = string.Empty;
        
        // User Statistics
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int NewUsersInPeriod { get; set; }
        
        // Job Seeker Statistics
        public int TotalJobSeekers { get; set; }
        public int ActiveJobSeekers { get; set; }
        
        // Employer Statistics
        public int TotalEmployers { get; set; }
        public int ApprovedEmployers { get; set; }
        public int PendingEmployers { get; set; }
        
        // Job Post Statistics
        public int TotalJobPosts { get; set; }
        public int ActiveJobPosts { get; set; }
        public int JobPostsInPeriod { get; set; }
        
        // Application Statistics
        public int TotalApplications { get; set; }
        public int ApplicationsInPeriod { get; set; }
        public int PendingApplications { get; set; }
        
        // Moderation Statistics
        public int FlaggedJobPosts { get; set; }
        public int RemovedJobPosts { get; set; }
        public int DeactivatedUsers { get; set; }
        
        // Activity Statistics
        public Dictionary<string, int> ActivityByDay { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
