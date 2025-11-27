using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    public class JobPost
    {
        [Key]
        public int JobPostId { get; set; }

        [Required]
        public int EmployerId { get; set; } //FK to Employer

        [ForeignKey("EmployerId")]
        public Employer Employer { get; set; }

        [Required(ErrorMessage = "Job title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Job description is required.")]
        [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters.")]
        public string Description { get; set; }

        [StringLength(1000, ErrorMessage = "Requirements cannot exceed 1000 characters.")]
        public string Requirements { get; set; }

        [StringLength(100, ErrorMessage = "Salary range cannot exceed 100 characters.")]
        public string SalaryRange { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(300, ErrorMessage = "Location cannot exceed 300 characters.")]
        public string Location { get; set; }

        [Required]
        public DateTime PostedDate {  get; set; }

        [Required]
        public DateTime DeadLineDate {  get; set; }

        [Required]
        public JobStatus Status { get; set; } // {Open/Closed}

        // Job Post Moderation Fields
        public bool IsRemoved { get; set; } = false;

        public int? RemovedByAdminId { get; set; }  // FK to Admin
        [ForeignKey("RemovedByAdminId")]
        public Admin RemovedBy { get; set; }

        public DateTime? RemovedAt { get; set; }

        [StringLength(1000, ErrorMessage = "Removal reason cannot exceed 1000 characters.")]
        public string RemovalReason { get; set; }

        public bool IsFlagged { get; set; } = false;

        public DateTime? FlaggedAt { get; set; }

        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    }
}
