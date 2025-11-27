using Job_Application.Models;
using Job_Application.Services;
using Microsoft.EntityFrameworkCore;

namespace Job_Application.Data
{
    public class DbSeeder
    {
        private readonly JobApplicationDbContext _context;

        public DbSeeder(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            // Check if admin already exists
            var adminExists = await _context.Users.AnyAsync(u => u.UserRole == UserRole.Admin);
            
            if (!adminExists)
            {
                // Create default admin account
                PasswordHasher.CreatePasswordHash("Admin@123", out byte[] hash, out byte[] salt);

                var adminUser = new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@jobapplication.com",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    UserRole = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true  // Make sure admin account is active
                };

                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();

                // Create Admin record
                var admin = new Admin
                {
                    UserId = adminUser.UserId
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                Console.WriteLine(" Default admin account created successfully!");
                Console.WriteLine($"   Email: {adminUser.Email}");
                Console.WriteLine("   Password: Admin@123");
                Console.WriteLine("   Please change this password after first login!");
            }
            else
            {
                Console.WriteLine(" Admin account already exists. Skipping seed.");
            }
        }
    }
}
