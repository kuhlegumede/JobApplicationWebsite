using Job_Application.Data;
using Job_Application.Dto;
using Job_Application.Models;
using Job_Application.Services;
using Job_Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Job_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly JobApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthController(IUserRepository userRepository,JobApplicationDbContext dbContext ,IConfiguration configuration)
        {
            _userRepository = userRepository;
            _dbContext = dbContext;
            _configuration = configuration;
        }

        // Register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationDto dto)
        {
            if (await _dbContext.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "A user with this email already exists." });

            // Hash password
            PasswordHasher.CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = hash,
                PasswordSalt = salt,
                UserRole = dto.UserRole,
                CreatedAt = DateTime.UtcNow,
                IsActive = dto.UserRole != UserRole.Employer  // Employers inactive until admin approval, others active
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();
            // Create role-specific records
            switch (dto.UserRole)
            {
                case UserRole.Admin:
                    _dbContext.Admins.Add(new Admin { UserId = user.UserId });
                    break;

                case UserRole.JobSeeker:
                    _dbContext.JobSeekers.Add(new JobSeeker
                    {
                        UserId = user.UserId,
                        ResumeFileId = null, // No CV uploaded initially
                        Skills = "",
                        Education = "",
                        PhoneNumber = ""
                    });
                    break;

                case UserRole.Employer:
                    _dbContext.Employers.Add(new Employer
                    {
                        UserId = user.UserId,
                        CompanyName = "",
                        Location = "",
                        ApprovalStatus = EmployerApprovalStatus.Pending  // Set as pending by default
                    });
                    break;
            }
            
            await _dbContext.SaveChangesAsync();
            return Ok(new
             {
                message = $"User registered successfully as {dto.UserRole}.",
                userId = user.UserId,
                role = dto.UserRole
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            /*if (!ModelState.IsValid)
            {
                return BadRequest(new ValidationProblemDetails(ModelState)
                {
                    Type = "https://localhost:7087",
                    Status = StatusCodes.Status400BadRequest
                });
            }*/
            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials." });

            // Check if user account is active
            if (!user.IsActive)
                return Unauthorized(new { message = "Your account has been deactivated. Please contact support." });

            bool isValid = PasswordHasher.VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt);
            if (!isValid)
                return Unauthorized(new { message = "Invalid credentials." });

            // JWT Settings
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Base Claims
            var claimsList = new List<Claim>
            {
                new Claim("UserId", user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.UserRole.ToString())
            };

            // Add role-specific claims
            object roleSpecificData = null;
            switch (user.UserRole)
            {
                case UserRole.JobSeeker:
                    var jobSeeker = await _dbContext.JobSeekers.FirstOrDefaultAsync(js => js.UserId == user.UserId);
                    if (jobSeeker != null)
                    {
                        claimsList.Add(new Claim("JobSeekerId", jobSeeker.JobSeekerId.ToString()));
                        roleSpecificData = new { jobSeekerId = jobSeeker.JobSeekerId };
                    }
                    break;
                case UserRole.Employer:
                    var employer = await _dbContext.Employers.FirstOrDefaultAsync(e => e.UserId == user.UserId);
                    if (employer != null)
                    {
                        claimsList.Add(new Claim("EmployerId", employer.EmployerId.ToString()));
                        roleSpecificData = new { employerId = employer.EmployerId };
                    }
                    break;
                case UserRole.Admin:
                    var admin = await _dbContext.Admins.FirstOrDefaultAsync(a => a.UserId == user.UserId);
                    if (admin != null)
                    {
                        claimsList.Add(new Claim("AdminId", admin.AdminId.ToString()));
                        roleSpecificData = new { adminId = admin.AdminId };
                    }
                    break;
            }

            var expiresInHours = jwtSettings.GetValue<double>("ExpiresInHours");

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claimsList,
                expires: DateTime.UtcNow.AddHours(expiresInHours),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                role = user.UserRole.ToString(),
                expires = DateTime.UtcNow.AddHours(Convert.ToDouble(jwtSettings["ExpiresInHours"])),
                user = new
                {
                    user.UserId,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    roleData = roleSpecificData
                }
            });
        }


    }
}
