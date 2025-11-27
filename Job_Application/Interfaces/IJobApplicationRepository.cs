using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IJobApplicationRepository
    {
    Task<IEnumerable<JobApplication>> GetAllApplications();
    Task<JobApplication>GetApplicationById(int id);
    Task<IEnumerable<JobApplication>> GetApplicationsByJobSeeker(int jobSeekerId);
    Task<IEnumerable<JobApplication>> GetApplicationsByJobPost(int jobPostId);
    Task<JobApplication> GetApplicationByJobSeekerAndJobPost(int jobSeekerId, int jobPostId);
    Task CreateApplication(JobApplication application);
    Task UpdateApplication(JobApplication application);
    Task DeleteApplication(JobApplication application);
    Task SaveChangesAsync();

    }
}
