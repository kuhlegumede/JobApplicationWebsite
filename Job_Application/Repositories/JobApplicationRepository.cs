using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Repositories
{
    public class JobApplicationRepository : IJobApplicationRepository
    {
        private readonly JobApplicationDbContext _context;
        public JobApplicationRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobApplication>> GetAllApplications()
        {
            return await _context.JobApplications.ToListAsync();
        }

        public async Task<JobApplication>GetApplicationById(int id)
        {
            return await _context.JobApplications.FirstOrDefaultAsync(x => x.JobApplicationId == id);
        }

        public async Task<IEnumerable<JobApplication>> GetApplicationsByJobSeeker(int jobSeekerId)
        {
            return await _context.JobApplications
                .Include(a => a.JobPost)
                    .ThenInclude(jp => jp.Employer)
                .Where(a => a.JobSeekerId == jobSeekerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobApplication>> GetApplicationsByJobPost(int jobPostId)
        {
            return await _context.JobApplications
                .Include(a => a.JobSeeker)
                    .ThenInclude(js => js.User)
                .Include(a => a.JobSeeker)
                    .ThenInclude(js => js.ResumeFile)
                .Include(a => a.InterviewSchedule)
                .Where(a => a.JobPostId == jobPostId)
                .OrderByDescending(a => a.DateApplied)
                .ToListAsync();
        }

        public async Task<JobApplication> GetApplicationByJobSeekerAndJobPost(int jobSeekerId, int jobPostId)
        {
            return await _context.JobApplications
                .FirstOrDefaultAsync(a => a.JobSeekerId == jobSeekerId && a.JobPostId == jobPostId);
        }

        public async Task CreateApplication(JobApplication application)
        {
            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateApplication(JobApplication application)
        {
            _context.JobApplications.Update(application);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteApplication(JobApplication application)
        {
            _context.JobApplications.Remove(application);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
