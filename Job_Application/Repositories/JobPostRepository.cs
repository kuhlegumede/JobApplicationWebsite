using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Repositories
{
    public class JobPostRepository : IJobPostRepository
    {
        private readonly JobApplicationDbContext _context;
        public JobPostRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobPost>>GetAllJobPosts()
        {
            return await _context.JobPosts
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.CompanyLogoFile)
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.User)
                .ToListAsync();
        }
        public async Task<JobPost>GetJobPostById(int id)
        {
            return await _context.JobPosts
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.CompanyLogoFile)
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.User)
                .FirstOrDefaultAsync(x => x.JobPostId == id);
        }

        public async Task<IEnumerable<JobSeeker>> GetRelevantJobSeekersAsync(JobPost job)
        {
            
            var requiredSkills = job.Requirements?.Split(',').Select(s => s.Trim().ToLower()) ?? new string[0];

            var seekers = await _context.JobSeekers
                .Include(js => js.User)
                .ToListAsync();

            var relevantSeekers = seekers
                .Where(js => !string.IsNullOrEmpty(js.Skills) &&
                             js.Skills.Split(',').Select(s => s.Trim().ToLower())
                                .Intersect(requiredSkills).Any())
                .ToList();

            return relevantSeekers;
        }
        public async Task CreateJobPost(JobPost job)
        {
            _context.JobPosts.Add(job);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateJobPost(JobPost job)
        {
             _context.JobPosts.Update(job);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteJobPost(JobPost job)
        {
            _context.JobPosts.Remove(job);
            await _context.SaveChangesAsync();
           
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // Job Post Moderation Methods
        public async Task<IEnumerable<JobPost>> GetRemovedJobPosts()
        {
            return await _context.JobPosts
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.User)
                .Include(jp => jp.RemovedBy)
                    .ThenInclude(a => a.User)
                .Where(jp => jp.IsRemoved)
                .OrderByDescending(jp => jp.RemovedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobPost>> GetFlaggedJobPosts()
        {
            return await _context.JobPosts
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.User)
                .Where(jp => jp.IsFlagged && !jp.IsRemoved)
                .OrderByDescending(jp => jp.FlaggedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobPost>> GetActiveJobPosts()
        {
            return await _context.JobPosts
                .Include(jp => jp.Employer)
                    .ThenInclude(e => e.User)
                .Where(jp => !jp.IsRemoved && jp.Status == JobStatus.Open)
                .OrderByDescending(jp => jp.PostedDate)
                .ToListAsync();
        }
    }
}
