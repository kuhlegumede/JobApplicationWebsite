using Job_Application.Models;
using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateUserDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(50)]
        public string FirstName {  get; set; }

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(50)]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [StringLength(100)]
        public string Email { get; set; }
        public string Password { get; set; }

        [Required(ErrorMessage = "User role is required.")]
        public UserRole UserRole { get; set; }
    }
}
