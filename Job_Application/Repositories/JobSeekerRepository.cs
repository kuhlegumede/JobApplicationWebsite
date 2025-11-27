using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Repositories
{
    public class JobSeekerRepository : IJobSeekerRepository
    {
        private readonly JobApplicationDbContext _context;
        public JobSeekerRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobSeeker>>GetAllJobSeekers()
        {
            return await _context.JobSeekers
                .Include(x => x.User)
                .Include(x => x.ProfilePictureFile)
                .Include(x => x.ResumeFile)
                .ToListAsync();
        }

        public async Task<JobSeeker>GetJobSeekerById(int id)
        {
            return await _context.JobSeekers
                .Include(x => x.User)
                .Include(x => x.ProfilePictureFile)
                .Include(x => x.ResumeFile)
                .FirstOrDefaultAsync(x=>x.JobSeekerId == id);
        }

        public async Task CreateJobSeeker(JobSeeker seeker)
        {
            _context.JobSeekers.Add(seeker);
            await _context.SaveChangesAsync();  
        }

        public async Task UpdateJobSeeker(JobSeeker seeker)
        {
            _context.JobSeekers.Update(seeker);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteJobSeeker(JobSeeker seeker)
        {
            _context.JobSeekers.Remove(seeker);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
