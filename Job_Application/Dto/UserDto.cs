using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class UserDto
    {
        public int UserId { get; set; }

        [Required(ErrorMessage = "First name is required.")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserRole { get; set; }

        public JobSeekerDto JobSeeker { get; set; }
        public EmployerDto Employer { get; set; }
        public AdminDto Admin { get; set; }
    }
}