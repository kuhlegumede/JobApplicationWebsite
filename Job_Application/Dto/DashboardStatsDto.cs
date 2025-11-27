namespace Job_Application.Dto
{
    public class DashboardStatsDto
    {
        public int TotalJobSeekers { get; set; }
        public int TotalEmployers { get; set; }
        public int PendingEmployers { get; set; }
        public int ApprovedEmployers { get; set; }
        public int RejectedEmployers { get; set; }
        public int TotalJobPosts { get; set; }
        public int ActiveJobPosts { get; set; }
        public int ClosedJobPosts { get; set; }
        public int RemovedJobPosts { get; set; }
        public int TotalApplications { get; set; }
        public int NewUsersLast7Days { get; set; }
        public int NewUsersLast30Days { get; set; }
    }
}
