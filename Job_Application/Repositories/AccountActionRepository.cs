using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;

namespace Job_Application.Repositories
{
    public class AccountActionRepository : IAccountActionRepository
    {
        private readonly JobApplicationDbContext _context;

        public AccountActionRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AccountAction>> GetAllActions()
        {
            return await _context.AccountActions
                .Include(aa => aa.User)
                .Include(aa => aa.PerformedBy)
                .OrderByDescending(aa => aa.ActionDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AccountAction>> GetActionsByUserId(int userId)
        {
            return await _context.AccountActions
                .Include(aa => aa.PerformedBy)
                    .ThenInclude(a => a.User)
                .Where(aa => aa.UserId == userId)
                .OrderByDescending(aa => aa.ActionDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AccountAction>> GetActionsByAdminId(int adminId)
        {
            return await _context.AccountActions
                .Include(aa => aa.User)
                .Where(aa => aa.PerformedByAdminId == adminId)
                .OrderByDescending(aa => aa.ActionDate)
                .ToListAsync();
        }

        public async Task<AccountAction> GetActionById(int actionId)
        {
            return await _context.AccountActions
                .Include(aa => aa.User)
                .Include(aa => aa.PerformedBy)
                .FirstOrDefaultAsync(aa => aa.ActionId == actionId);
        }

        public async Task CreateAction(AccountAction action)
        {
            await _context.AccountActions.AddAsync(action);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
