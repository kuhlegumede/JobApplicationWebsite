using Job_Application.Models;

namespace Job_Application.Interfaces
{
    public interface IAssessmentRepository
    {
        Task<IEnumerable<Assessment>> GetAllAssessments();
        Task<IEnumerable<Assessment>> GetAssessmentsByEmployerId(int employerId);
        Task<Assessment?> GetAssessmentById(int id);
        Task<Assessment> CreateAssessment(Assessment assessment);
        Task UpdateAssessment(Assessment assessment);
        Task DeleteAssessment(Assessment assessment);
        Task<AssessmentAssignment> CreateAssignment(AssessmentAssignment assignment);
        Task<IEnumerable<AssessmentAssignment>> GetAssignmentsByAssessmentId(int assessmentId);
        Task<IEnumerable<AssessmentAssignment>> GetAssignmentsByJobSeekerId(int jobSeekerId);
        Task<AssessmentAssignment?> GetAssignmentById(int assignmentId);
        Task<AssessmentAssignment?> GetAssignmentByIdWithDetails(int assignmentId);
        Task UpdateAssignment(AssessmentAssignment assignment);
        Task SaveChangesAsync();
    }
}
