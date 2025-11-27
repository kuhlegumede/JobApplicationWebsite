using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;

namespace Job_Application.Repositories
{
    public class AssessmentRepository : IAssessmentRepository
    {
        private readonly JobApplicationDbContext _context;

        public AssessmentRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Assessment>> GetAllAssessments()
        {
            return await _context.Assessments
                .Include(a => a.Employer)
                .ThenInclude(e => e!.User)
                .Include(a => a.Questions)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Assessment>> GetAssessmentsByEmployerId(int employerId)
        {
            return await _context.Assessments
                .Include(a => a.Questions)
                .Where(a => a.EmployerId == employerId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Assessment?> GetAssessmentById(int id)
        {
            return await _context.Assessments
                .Include(a => a.Employer)
                .ThenInclude(e => e!.User)
                .Include(a => a.Questions)
                .FirstOrDefaultAsync(a => a.AssessmentId == id);
        }

        public async Task<Assessment> CreateAssessment(Assessment assessment)
        {
            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();
            return assessment;
        }

        public async Task UpdateAssessment(Assessment assessment)
        {
            _context.Assessments.Update(assessment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAssessment(Assessment assessment)
        {
            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();
        }

        public async Task<AssessmentAssignment> CreateAssignment(AssessmentAssignment assignment)
        {
            _context.AssessmentAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }

        public async Task<IEnumerable<AssessmentAssignment>> GetAssignmentsByAssessmentId(int assessmentId)
        {
            return await _context.AssessmentAssignments
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js!.User)
                .Include(a => a.Assessment)
                .Where(a => a.AssessmentId == assessmentId)
                .OrderByDescending(a => a.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AssessmentAssignment>> GetAssignmentsByJobSeekerId(int jobSeekerId)
        {
            return await _context.AssessmentAssignments
                .Include(a => a.Assessment)
                .ThenInclude(a => a!.Questions)
                .Include(a => a.Assessment)
                .ThenInclude(a => a!.Employer)
                .ThenInclude(e => e!.User)
                .Where(a => a.JobSeekerId == jobSeekerId)
                .OrderByDescending(a => a.AssignedAt)
                .ToListAsync();
        }

        public async Task<AssessmentAssignment?> GetAssignmentById(int assignmentId)
        {
            return await _context.AssessmentAssignments
                .Include(a => a.Assessment)
                .ThenInclude(a => a!.Questions)
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js!.User)
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);
        }

        public async Task<AssessmentAssignment?> GetAssignmentByIdWithDetails(int assignmentId)
        {
            return await _context.AssessmentAssignments
                .Include(a => a.Assessment)
                .ThenInclude(a => a!.Questions)
                .Include(a => a.Assessment)
                .ThenInclude(a => a!.Employer)
                .ThenInclude(e => e!.User)
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js!.User)
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);
        }

        public async Task UpdateAssignment(AssessmentAssignment assignment)
        {
            _context.AssessmentAssignments.Update(assignment);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
