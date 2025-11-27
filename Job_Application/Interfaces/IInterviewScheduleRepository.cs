using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IInterviewScheduleRepository
    {
        Task<IEnumerable<InterviewSchedule>>GetAllSchedules();
        Task<InterviewSchedule>GetScheduleById(int id);
        Task<InterviewSchedule>GetScheduleByApplicationId(int jobApplicationId);
        Task<IEnumerable<InterviewSchedule>>GetSchedulesByJobSeekerId(int jobSeekerId);
        Task CreateSchedule(InterviewSchedule schedule);
        Task UpdateSchedule(InterviewSchedule schedule);
        Task DeleteSchedule(InterviewSchedule schedule);
        Task SaveChangesAsync();
    }
}
