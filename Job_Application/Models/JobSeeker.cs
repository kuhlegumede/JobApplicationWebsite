using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    public class JobSeeker
    {
        [Key]
        public int JobSeekerId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; }

        public int? ResumeFileId { get; set; }               // Foreign key to UploadedFile
        [ForeignKey("ResumeFileId")]
        public UploadedFile ResumeFile { get; set; }         // Navigation property

        public int? ProfilePictureFileId { get; set; }       // Foreign key to UploadedFile for profile picture
        [ForeignKey("ProfilePictureFileId")]
        public UploadedFile ProfilePictureFile { get; set; } // Navigation property for profile picture

        [Required(ErrorMessage = "Skills are required.")]
        [StringLength(500, ErrorMessage = "skills cannot exceed 500 characters.")]
        public string Skills {  get; set; }
        public string Experience { get; set; }

        [Required(ErrorMessage = "Education is required.")]
        [StringLength(500, ErrorMessage = "Education cannot exceed 500 characters.")]
        public string Education {  get; set; }

        [StringLength(1000, ErrorMessage = "Cover letter cannot excceed 1000 characters.")]
        public string CoverLetter {  get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber {  get; set; }

        public ICollection<JobApplication> JobApplications {  get; set; } = new List<JobApplication>();

    }
}
