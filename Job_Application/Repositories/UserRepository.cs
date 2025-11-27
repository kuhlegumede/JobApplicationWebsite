using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Job_Application.Services;
namespace Job_Application.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly JobApplicationDbContext _context;
        public UserRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>>GetAllUsers()
        {
            return await _context.Users.Include(js=>js.JobSeeker).Include(e=>e.Employer).Include(a=>a.Admin).ToListAsync();
        }

        public async Task<User>GetUserById(int id)
        {
            return await _context.Users.Include(a=>a.Admin).Include(js=>js.JobSeeker).Include(e=>e.Employer).FirstOrDefaultAsync(x => x.UserId == id);
        }

        public async Task CreateUser(User user, string password)
        {
            PasswordHasher.CreatePasswordHash(password, out byte[] hash, out byte[] salt);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            switch(user.UserRole)
            {
                case UserRole.JobSeeker:
                    var jobSeeker = new JobSeeker
                    {
                        UserId = user.UserId,
                        ResumeFileId = null, // No CV uploaded initially
                        Skills = "",
                        Education = "",
                        PhoneNumber = ""
                    };
                    _context.JobSeekers.Add(jobSeeker);
                    break;

                case UserRole.Employer:
                    var employer = new Employer
                    {
                        UserId = user.UserId,
                        CompanyName = "",
                        Location = ""
                    };
                    _context.Employers.Add(employer);
                    break;

                case UserRole.Admin:
                    var admin = new Admin
                    {
                        UserId = user.UserId
                    };
                    _context.Admins.Add(admin);
                    break;
            }
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUser(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
           
        }

        public async Task DeleteUser(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // Account Management Methods
        public async Task<IEnumerable<User>> GetActiveUsers()
        {
            return await _context.Users
                .Include(u => u.JobSeeker)
                .Include(u => u.Employer)
                .Include(u => u.Admin)
                .Where(u => u.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetDeactivatedUsers()
        {
            return await _context.Users
                .Include(u => u.JobSeeker)
                .Include(u => u.Employer)
                .Include(u => u.Admin)
                .Where(u => !u.IsActive)
                .OrderByDescending(u => u.DeactivatedAt)
                .ToListAsync();
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.Users
                .Include(u => u.JobSeeker)
                .Include(u => u.Employer)
                .Include(u => u.Admin)
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
