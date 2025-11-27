using Job_Application.Models;
using System.ComponentModel.DataAnnotations;

namespace Job_Application.Dto
{
    public class EmployerApprovalDto
    {
        public int EmployerId { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; }
        public string CompanyDescription { get; set; }
        public string Location { get; set; }
        public string Website { get; set; }
        public EmployerApprovalStatus ApprovalStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public string EmployerEmail { get; set; }
        public string EmployerFirstName { get; set; }
        public string EmployerLastName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        public string RejectionReason { get; set; }
    }
}
