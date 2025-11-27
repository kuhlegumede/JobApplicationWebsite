using Job_Application.Data;
using Job_Application.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Job_Application.Filters
{
    public class RequireApprovedEmployerAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            // Get the DbContext from DI
            var dbContext = context.HttpContext.RequestServices
                .GetService(typeof(JobApplicationDbContext)) as JobApplicationDbContext;

            if (dbContext == null)
            {
                context.Result = new StatusCodeResult(500);
                return;
            }

            // Get EmployerId from claims
            var employerIdClaim = context.HttpContext.User.FindFirst("EmployerId")?.Value;
            
            if (string.IsNullOrEmpty(employerIdClaim))
            {
                context.Result = new UnauthorizedObjectResult(new 
                { 
                    message = "Employer ID not found in token. Please log in as an employer." 
                });
                return;
            }

            if (!int.TryParse(employerIdClaim, out int employerId))
            {
                context.Result = new UnauthorizedObjectResult(new 
                { 
                    message = "Invalid employer ID in token." 
                });
                return;
            }

            // Check employer approval status
            var employer = await dbContext.Employers
                .FirstOrDefaultAsync(e => e.EmployerId == employerId);

            if (employer == null)
            {
                context.Result = new NotFoundObjectResult(new 
                { 
                    message = "Employer profile not found." 
                });
                return;
            }

            if (employer.ApprovalStatus == EmployerApprovalStatus.Pending)
            {
                context.Result = new ObjectResult(new 
                { 
                    message = "Your employer account is pending approval. You cannot create job posts until your account is approved by an administrator.",
                    approvalStatus = "Pending"
                })
                {
                    StatusCode = 403
                };
                return;
            }

            if (employer.ApprovalStatus == EmployerApprovalStatus.Rejected)
            {
                context.Result = new ObjectResult(new 
                { 
                    message = $"Your employer account has been rejected. Reason: {employer.RejectionReason ?? "Not specified"}. Please contact support.",
                    approvalStatus = "Rejected",
                    rejectionReason = employer.RejectionReason
                })
                {
                    StatusCode = 403
                };
                return;
            }

            // Employer is approved, proceed with the action
            await next();
        }
    }
}
