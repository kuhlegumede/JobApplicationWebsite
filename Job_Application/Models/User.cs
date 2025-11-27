using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        [Key]
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
        public string Email {  get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }
        [Required]
        public byte[] PasswordSalt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        [EnumDataType(typeof(UserRole), ErrorMessage = "Invalid User Role entered.")]
        public UserRole UserRole {  get; set; }

        // Account Management Fields
        public bool IsActive { get; set; } = true;

        public DateTime? DeactivatedAt { get; set; }

        public int? DeactivatedByAdminId { get; set; }

        [StringLength(500, ErrorMessage = "Deactivation reason cannot exceed 500 characters.")]
        public string DeactivationReason { get; set; }

        //Navigation to JobSeekerProfile (one-to-one)
        public JobSeeker JobSeeker { get; set; }

        //Navigation to EmployerProfile (one-to-one)
        public Employer Employer { get; set; }

        //Navigation to AdminProfile (one-to-one)
        public Admin Admin { get; set; }
    }
}

