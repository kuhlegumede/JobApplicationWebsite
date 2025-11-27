using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    public class InterviewSchedule
    {
        [Key]
        public int InterviewId { get; set; }

        [Required]
        public int JobApplicationId {  get; set; } //FK to Application
        [ForeignKey(nameof(JobApplicationId))]
        public JobApplication JobApplication { get; set; }

        [Required(ErrorMessage = "Schedule date is required.")]
        public DateTime ScheduleDate { get; set; }

        [Required]
        public InterviewMode Mode { get; set; }

        [StringLength(1000,ErrorMessage = "Notes cannot exceed 1000 chaaracters.")]
        public string Notes { get; set; }
    }
}
