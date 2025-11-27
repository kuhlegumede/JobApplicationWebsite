using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Job_Application.Repositories
{
    public class AdminRepository : IAdminRepository
    {
         
        private readonly JobApplicationDbContext _context;

        public AdminRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Admin>> GetAllAdmins()
        {
            return await _context.Admins.ToListAsync();
        }

        public async Task<Admin> GetAdminById(int id)
        {
            return await _context.Admins.Include(a => a.User).FirstOrDefaultAsync(a => a.AdminId == id);
        }

        public async Task CreateAdmin(Admin admin)
        {
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAdmin(Admin admin)
        {
            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAdmin(Admin admin)
        {
            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
