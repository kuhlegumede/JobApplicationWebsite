using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;
namespace Job_Application.Models
{
    public class Employer
    {
        [Key]
        public int EmployerId {  get; set; }

        [ForeignKey("User")]
        public int UserId {  get; set; }
        public User User { get; set; }

        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters.")]
        public string CompanyName { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string CompanyDescription {  get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(300, ErrorMessage = "Location cannot exceed 300 characters")]
        public string Location { get; set; }

        [Url(ErrorMessage = "Please enter a valid website URL")]
        public string Website {  get; set; }

        public int? CompanyLogoFileId { get; set; }          // Foreign key to UploadedFile for company logo
        [ForeignKey("CompanyLogoFileId")]
        public UploadedFile CompanyLogoFile { get; set; }    // Navigation property for company logo

        // Employer Approval Fields
        [Required]
        public EmployerApprovalStatus ApprovalStatus { get; set; } = EmployerApprovalStatus.Pending;

        public int? ApprovedByAdminId { get; set; }  // FK to Admin
        [ForeignKey("ApprovedByAdminId")]
        public Admin ApprovedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public DateTime? RejectedAt { get; set; }

        [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters.")]
        public string RejectionReason { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public ICollection<JobPost>JobPosts { get; set; } = new List<JobPost>();
    }
}
