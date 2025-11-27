using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    public class JobApplication
    {
        [Key]
        public int JobApplicationId { get; set; }

        [Required]
        public int JobPostId { get; set; } //FK to JobPost

        [ForeignKey(nameof(JobPostId))]
        public JobPost JobPost { get; set; }

        [Required]
        public int JobSeekerId { get; set; } //FK to JobSeeker

        [ForeignKey(nameof(JobSeekerId))]
        public JobSeeker JobSeeker { get; set; }

        [Required(ErrorMessage = "Resume is required.")]
        [StringLength(500, ErrorMessage = "Resume URL cannot exceed 500 characters.")]
        public string Resume {  get; set; }

        public bool SameResumeUsed { get; set; } //True if same resume is used.

        [StringLength(1000, ErrorMessage = "Cover Letter cannot exceed 1000 characters.")]
        public string CoverLetter {  get; set; }

        [Required]
        public DateTime DateApplied { get; set; }

        [Required]
        public ApplicationStatus ApplicationStatus { get; set; }

        [Required]
        public DateTime LastUpdated { get; set; }

        public InterviewSchedule InterviewSchedule { get; set; } 

    }
}
