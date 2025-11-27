using Job_Application.Data;
using Job_Application.Dto;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;

namespace Job_Application.Services
{
    public interface IAnalyticsService
    {
        Task<ApplicationTrendsDto> GetApplicationTrends(DateTime? startDate, DateTime? endDate);
        Task<UserGrowthDto> GetUserGrowth(DateTime? startDate, DateTime? endDate);
        Task<JobPostAnalyticsDto> GetJobPostAnalytics(DateTime? startDate, DateTime? endDate);
        Task<EmployerAnalyticsDto> GetEmployerAnalytics(DateTime? startDate, DateTime? endDate);
        Task<SystemOverviewDto> GetSystemOverview(DateTime? startDate, DateTime? endDate);
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly JobApplicationDbContext _context;

        public AnalyticsService(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApplicationTrendsDto> GetApplicationTrends(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.UtcNow.AddMonths(-6);
            endDate ??= DateTime.UtcNow;

            var applications = await _context.JobApplications
                .Include(a => a.JobPost)
                    .ThenInclude(jp => jp.Employer)
                .Where(a => a.DateApplied >= startDate && a.DateApplied <= endDate)
                .ToListAsync();

            var applicationsByMonth = applications
                .GroupBy(a => new { a.DateApplied.Year, a.DateApplied.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .ToDictionary(
                    g => $"{g.Key.Year}-{g.Key.Month:D2}",
                    g => g.Count()
                );

            var applicationsByStatus = applications
                .GroupBy(a => a.ApplicationStatus.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var mostAppliedJobs = applications
                .GroupBy(a => new { a.JobPostId, a.JobPost.Title, a.JobPost.Employer.CompanyName })
                .Select(g => new TopJobPostDto
                {
                    JobPostId = g.Key.JobPostId,
                    JobTitle = g.Key.Title,
                    CompanyName = g.Key.CompanyName,
                    ApplicationCount = g.Count()
                })
                .OrderByDescending(x => x.ApplicationCount)
                .Take(10)
                .ToList();

            var totalJobs = await _context.JobPosts
                .Where(jp => jp.PostedDate >= startDate && jp.PostedDate <= endDate)
                .CountAsync();

            return new ApplicationTrendsDto
            {
                TotalApplications = applications.Count,
                PendingApplications = applications.Count(a => a.ApplicationStatus == ApplicationStatus.Submitted),
                ReviewedApplications = applications.Count(a => a.ApplicationStatus == ApplicationStatus.UnderReview),
                AcceptedApplications = applications.Count(a => a.ApplicationStatus == ApplicationStatus.Hired),
                RejectedApplications = applications.Count(a => a.ApplicationStatus == ApplicationStatus.Rejected),
                ApplicationsByMonth = applicationsByMonth,
                ApplicationsByStatus = applicationsByStatus,
                AverageApplicationsPerJob = totalJobs > 0 ? (double)applications.Count / totalJobs : 0,
                MostAppliedJobs = mostAppliedJobs
            };
        }

        public async Task<UserGrowthDto> GetUserGrowth(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.UtcNow.AddMonths(-6);
            endDate ??= DateTime.UtcNow;

            var allUsers = await _context.Users.ToListAsync();
            var usersInPeriod = allUsers.Where(u => u.CreatedAt >= startDate && u.CreatedAt <= endDate).ToList();

            var usersByMonth = usersInPeriod
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .ToDictionary(
                    g => $"{g.Key.Year}-{g.Key.Month:D2}",
                    g => g.Count()
                );

            var usersByRole = allUsers
                .GroupBy(u => u.UserRole.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var currentMonth = DateTime.UtcNow;
            var newUsersThisMonth = allUsers.Count(u => u.CreatedAt.Year == currentMonth.Year && u.CreatedAt.Month == currentMonth.Month);
            var lastMonth = currentMonth.AddMonths(-1);
            var newUsersLastMonth = allUsers.Count(u => u.CreatedAt.Year == lastMonth.Year && u.CreatedAt.Month == lastMonth.Month);

            var growthRate = newUsersLastMonth > 0 
                ? ((double)(newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
                : 0;

            return new UserGrowthDto
            {
                TotalUsers = allUsers.Count,
                ActiveUsers = allUsers.Count(u => u.IsActive),
                InactiveUsers = allUsers.Count(u => !u.IsActive),
                TotalJobSeekers = allUsers.Count(u => u.UserRole == UserRole.JobSeeker),
                TotalEmployers = allUsers.Count(u => u.UserRole == UserRole.Employer),
                TotalAdmins = allUsers.Count(u => u.UserRole == UserRole.Admin),
                UsersByMonth = usersByMonth,
                UsersByRole = usersByRole,
                NewUsersThisMonth = newUsersThisMonth,
                NewUsersLastMonth = newUsersLastMonth,
                GrowthRate = Math.Round(growthRate, 2)
            };
        }

        public async Task<JobPostAnalyticsDto> GetJobPostAnalytics(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.UtcNow.AddMonths(-6);
            endDate ??= DateTime.UtcNow;

            var jobPosts = await _context.JobPosts
                .Include(jp => jp.Employer)
                .Include(jp => jp.JobApplications)
                .Where(jp => jp.PostedDate >= startDate && jp.PostedDate <= endDate)
                .ToListAsync();

            var allJobPosts = await _context.JobPosts
                .Include(jp => jp.Employer)
                .Include(jp => jp.JobApplications)
                .ToListAsync();

            var jobPostsByMonth = jobPosts
                .GroupBy(jp => new { jp.PostedDate.Year, jp.PostedDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .ToDictionary(
                    g => $"{g.Key.Year}-{g.Key.Month:D2}",
                    g => g.Count()
                );

            var jobPostsByStatus = allJobPosts
                .GroupBy(jp => jp.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var topEmployers = allJobPosts
                .GroupBy(jp => new { jp.EmployerId, jp.Employer.CompanyName })
                .Select(g => new EmployerJobPostStatsDto
                {
                    EmployerId = g.Key.EmployerId,
                    CompanyName = g.Key.CompanyName,
                    TotalJobPosts = g.Count(),
                    ActiveJobPosts = g.Count(jp => jp.Status == JobStatus.Open),
                    TotalApplications = g.Sum(jp => jp.JobApplications.Count)
                })
                .OrderByDescending(x => x.TotalJobPosts)
                .Take(10)
                .ToList();

            var closedJobs = allJobPosts.Where(jp => jp.Status == JobStatus.Closed && jp.PostedDate >= startDate).ToList();
            var avgDuration = closedJobs.Any() 
                ? closedJobs.Average(jp => (DateTime.UtcNow - jp.PostedDate).TotalDays) 
                : 0;

            return new JobPostAnalyticsDto
            {
                TotalJobPosts = allJobPosts.Count,
                ActiveJobPosts = allJobPosts.Count(jp => jp.Status == JobStatus.Open),
                ClosedJobPosts = allJobPosts.Count(jp => jp.Status == JobStatus.Closed),
                RemovedJobPosts = allJobPosts.Count(jp => jp.IsRemoved),
                FlaggedJobPosts = allJobPosts.Count(jp => jp.IsFlagged),
                JobPostsByMonth = jobPostsByMonth,
                JobPostsByStatus = jobPostsByStatus,
                TopEmployers = topEmployers,
                AverageJobDuration = Math.Round(avgDuration, 2)
            };
        }

        public async Task<EmployerAnalyticsDto> GetEmployerAnalytics(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.UtcNow.AddMonths(-6);
            endDate ??= DateTime.UtcNow;

            var employers = await _context.Employers
                .Include(e => e.User)
                .ToListAsync();

            var employersInPeriod = employers.Where(e => e.User.CreatedAt >= startDate && e.User.CreatedAt <= endDate).ToList();

            var employersByMonth = employersInPeriod
                .GroupBy(e => new { e.User.CreatedAt.Year, e.User.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .ToDictionary(
                    g => $"{g.Key.Year}-{g.Key.Month:D2}",
                    g => g.Count()
                );

            var employersByStatus = employers
                .GroupBy(e => e.ApprovalStatus.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            var currentMonth = DateTime.UtcNow;
            var newEmployersThisMonth = employers.Count(e => 
                e.User.CreatedAt.Year == currentMonth.Year && e.User.CreatedAt.Month == currentMonth.Month);
            var employersApprovedThisMonth = employers.Count(e => 
                e.ApprovedAt.HasValue && e.ApprovedAt.Value.Year == currentMonth.Year && e.ApprovedAt.Value.Month == currentMonth.Month);

            var approvedEmployers = employers.Where(e => e.ApprovalStatus == EmployerApprovalStatus.Approved).ToList();
            var approvalRate = employers.Count > 0 
                ? ((double)approvedEmployers.Count / employers.Count) * 100 
                : 0;

            var approvalTimes = approvedEmployers
                .Where(e => e.ApprovedAt.HasValue)
                .Select(e => (e.ApprovedAt!.Value - e.User.CreatedAt).TotalHours)
                .ToList();
            var avgApprovalTime = approvalTimes.Any() ? approvalTimes.Average() : 0;

            return new EmployerAnalyticsDto
            {
                TotalEmployers = employers.Count,
                ApprovedEmployers = approvedEmployers.Count,
                PendingEmployers = employers.Count(e => e.ApprovalStatus == EmployerApprovalStatus.Pending),
                RejectedEmployers = employers.Count(e => e.ApprovalStatus == EmployerApprovalStatus.Rejected),
                EmployersByMonth = employersByMonth,
                EmployersByStatus = employersByStatus,
                ApprovalRate = Math.Round(approvalRate, 2),
                NewEmployersThisMonth = newEmployersThisMonth,
                EmployersApprovedThisMonth = employersApprovedThisMonth,
                AverageApprovalTime = Math.Round(avgApprovalTime, 2)
            };
        }

        public async Task<SystemOverviewDto> GetSystemOverview(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.UtcNow.AddDays(-30);
            endDate ??= DateTime.UtcNow;

            var users = await _context.Users.ToListAsync();
            var jobSeekers = await _context.JobSeekers.Include(js => js.User).ToListAsync();
            var employers = await _context.Employers.Include(e => e.User).ToListAsync();
            var jobPosts = await _context.JobPosts.ToListAsync();
            var applications = await _context.JobApplications.ToListAsync();
            var accountActions = await _context.AccountActions
                .OrderByDescending(aa => aa.ActionDate)
                .Take(20)
                .ToListAsync();

            var activityByDay = applications
                .Where(a => a.DateApplied >= startDate && a.DateApplied <= endDate)
                .GroupBy(a => a.DateApplied.Date)
                .OrderBy(g => g.Key)
                .ToDictionary(
                    g => g.Key.ToString("yyyy-MM-dd"),
                    g => g.Count()
                );

            var recentActivities = accountActions
                .Select(aa => new RecentActivityDto
                {
                    ActivityType = aa.ActionType.ToString(),
                    Description = $"User {aa.UserId} - {aa.ActionType}: {aa.Reason}",
                    Timestamp = aa.ActionDate
                })
                .ToList();

            return new SystemOverviewDto
            {
                GeneratedAt = DateTime.UtcNow,
                DateRange = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}",
                TotalUsers = users.Count,
                ActiveUsers = users.Count(u => u.IsActive),
                NewUsersInPeriod = users.Count(u => u.CreatedAt >= startDate && u.CreatedAt <= endDate),
                TotalJobSeekers = jobSeekers.Count,
                ActiveJobSeekers = jobSeekers.Count(js => js.User.IsActive),
                TotalEmployers = employers.Count,
                ApprovedEmployers = employers.Count(e => e.ApprovalStatus == EmployerApprovalStatus.Approved),
                PendingEmployers = employers.Count(e => e.ApprovalStatus == EmployerApprovalStatus.Pending),
                TotalJobPosts = jobPosts.Count,
                ActiveJobPosts = jobPosts.Count(jp => jp.Status == JobStatus.Open),
                JobPostsInPeriod = jobPosts.Count(jp => jp.PostedDate >= startDate && jp.PostedDate <= endDate),
                TotalApplications = applications.Count,
                ApplicationsInPeriod = applications.Count(a => a.DateApplied >= startDate && a.DateApplied <= endDate),
                PendingApplications = applications.Count(a => a.ApplicationStatus == ApplicationStatus.Submitted),
                FlaggedJobPosts = jobPosts.Count(jp => jp.IsFlagged),
                RemovedJobPosts = jobPosts.Count(jp => jp.IsRemoved),
                DeactivatedUsers = users.Count(u => !u.IsActive),
                ActivityByDay = activityByDay,
                RecentActivities = recentActivities
            };
        }
    }
}
