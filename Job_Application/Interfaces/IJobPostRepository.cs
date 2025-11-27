using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IJobPostRepository
    {
        Task<IEnumerable<JobPost>> GetAllJobPosts();
        Task<IEnumerable<JobSeeker>> GetRelevantJobSeekersAsync(JobPost job);
        Task<JobPost>GetJobPostById(int id);
        Task CreateJobPost(JobPost job);
        Task UpdateJobPost(JobPost job);
        Task DeleteJobPost(JobPost job);
        Task SaveChangesAsync();

        // Job Post Moderation Methods
        Task<IEnumerable<JobPost>> GetRemovedJobPosts();
        Task<IEnumerable<JobPost>> GetFlaggedJobPosts();
        Task<IEnumerable<JobPost>> GetActiveJobPosts();
    }
}
