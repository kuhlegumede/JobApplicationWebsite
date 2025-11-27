namespace Job_Application.Dto
{
    public class EmployerAnalyticsDto
    {
        public int TotalEmployers { get; set; }
        public int ApprovedEmployers { get; set; }
        public int PendingEmployers { get; set; }
        public int RejectedEmployers { get; set; }
        public Dictionary<string, int> EmployersByMonth { get; set; } = new();
        public Dictionary<string, int> EmployersByStatus { get; set; } = new();
        public double ApprovalRate { get; set; }
        public int NewEmployersThisMonth { get; set; }
        public int EmployersApprovedThisMonth { get; set; }
        public double AverageApprovalTime { get; set; } // Hours
    }
}
