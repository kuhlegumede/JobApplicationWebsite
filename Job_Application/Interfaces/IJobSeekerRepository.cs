using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IJobSeekerRepository
    {
        Task<IEnumerable<JobSeeker>> GetAllJobSeekers();
        Task<JobSeeker> GetJobSeekerById(int id);
        Task CreateJobSeeker(JobSeeker seeker);
        Task UpdateJobSeeker(JobSeeker seeker);
        Task DeleteJobSeeker(JobSeeker seeker);
        Task SaveChangesAsync();
    }
}
