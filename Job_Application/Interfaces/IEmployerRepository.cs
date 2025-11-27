using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IEmployerRepository
    {
        Task<IEnumerable<Employer>> GetAllEmployers();
        Task<Employer>GetEmployerById(int id);
        Task CreateEmployer(Employer employer);
        Task UpdateEmployer(Employer employer);
        Task DeleteEmployer(Employer employer);
        Task SaveChangesAsync();

        // Employer Approval Methods
        Task<IEnumerable<Employer>> GetPendingEmployers();
        Task<IEnumerable<Employer>> GetEmployersByApprovalStatus(EmployerApprovalStatus status);
        Task<Employer> GetEmployerByUserId(int userId);
    }
}
