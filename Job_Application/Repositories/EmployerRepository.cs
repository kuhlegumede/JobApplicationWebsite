using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Repositories
{
    public class EmployerRepository : IEmployerRepository
    {
        private readonly JobApplicationDbContext _context;
        public EmployerRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employer>>GetAllEmployers()
        {
            return await _context.Employers
                .Include(x => x.User)
                .Include(x => x.CompanyLogoFile)
                .ToListAsync();
        }

        public async Task<Employer>GetEmployerById(int id)
        {
            return await _context.Employers
                .Include(x => x.User)
                .Include(x => x.CompanyLogoFile)
                .FirstOrDefaultAsync(x => x.EmployerId == id);
        }

        public async Task CreateEmployer(Employer employer)
        {
            _context.Employers.Add(employer);
            await _context.SaveChangesAsync();
           
        }

        public async Task UpdateEmployer(Employer employer)
        {
             _context.Employers.Update(employer);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployer(Employer employer)
        {
            _context.Employers.Remove(employer);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // Employer Approval Methods
        public async Task<IEnumerable<Employer>> GetPendingEmployers()
        {
            return await _context.Employers
                .Include(e => e.User)
                .Include(e => e.CompanyLogoFile)
                .Where(e => e.ApprovalStatus == EmployerApprovalStatus.Pending)
                .OrderBy(e => e.User.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Employer>> GetEmployersByApprovalStatus(EmployerApprovalStatus status)
        {
            return await _context.Employers
                .Include(e => e.User)
                .Include(e => e.CompanyLogoFile)
                .Include(e => e.ApprovedBy)
                    .ThenInclude(a => a.User)
                .Where(e => e.ApprovalStatus == status)
                .OrderByDescending(e => e.ReviewedAt ?? e.User.CreatedAt)
                .ToListAsync();
        }

        public async Task<Employer> GetEmployerByUserId(int userId)
        {
            return await _context.Employers
                .Include(e => e.User)
                .Include(e => e.CompanyLogoFile)
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }
    }
}
