using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Repositories
{
    public class InterviewScheduleRepository : IInterviewScheduleRepository
    {
        private readonly JobApplicationDbContext _context;
        public InterviewScheduleRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InterviewSchedule>>GetAllSchedules()
        {
            return await _context.InterviewSchedules.ToListAsync();
        }

        public async Task<InterviewSchedule>GetScheduleById(int id)
        {
            return await _context.InterviewSchedules
                .Include(i => i.JobApplication)
                    .ThenInclude(ja => ja.JobSeeker)
                        .ThenInclude(js => js.User)
                .Include(i => i.JobApplication)
                    .ThenInclude(ja => ja.JobPost)
                .FirstOrDefaultAsync(x => x.InterviewId == id);
        }

        public async Task<InterviewSchedule>GetScheduleByApplicationId(int jobApplicationId)
        {
            return await _context.InterviewSchedules
                .Include(i => i.JobApplication)
                .FirstOrDefaultAsync(x => x.JobApplicationId == jobApplicationId);
        }

        public async Task<IEnumerable<InterviewSchedule>>GetSchedulesByJobSeekerId(int jobSeekerId)
        {
            return await _context.InterviewSchedules
                .Include(i => i.JobApplication)
                    .ThenInclude(ja => ja.JobPost)
                        .ThenInclude(jp => jp.Employer)
                .Where(i => i.JobApplication.JobSeekerId == jobSeekerId)
                .OrderByDescending(i => i.ScheduleDate)
                .ToListAsync();
        }

        public async Task CreateSchedule(InterviewSchedule schedule)
        {
            _context.InterviewSchedules.Add(schedule);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateSchedule(InterviewSchedule schedule)
        {
            _context.InterviewSchedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteSchedule(InterviewSchedule schedule)
        {
            _context.InterviewSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
