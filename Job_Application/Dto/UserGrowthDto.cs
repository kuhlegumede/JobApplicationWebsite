namespace Job_Application.Dto
{
    public class UserGrowthDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public int TotalJobSeekers { get; set; }
        public int TotalEmployers { get; set; }
        public int TotalAdmins { get; set; }
        public Dictionary<string, int> UsersByMonth { get; set; } = new();
        public Dictionary<string, int> UsersByRole { get; set; } = new();
        public int NewUsersThisMonth { get; set; }
        public int NewUsersLastMonth { get; set; }
        public double GrowthRate { get; set; }
    }
}
