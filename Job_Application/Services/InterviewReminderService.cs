using Job_Application.Interfaces;
using Job_Application.Models;
using System;
using System.Threading.Tasks;

namespace Job_Application.Services
{
    public class InterviewReminderService
    {
        private readonly INotificationRepository _notificationRepo;

        public InterviewReminderService(INotificationRepository notificationRepo)
        {
            _notificationRepo = notificationRepo;
        }

        public async Task SendInterviewReminderAsync(InterviewSchedule interviewSchedule)
        {
            if (interviewSchedule?.JobApplication == null) return;

            var jobSeekerId = interviewSchedule.JobApplication.JobSeekerId;

            if (jobSeekerId > 0)
            {
                var message = $"Reminder: Your interview is tomorrow at {interviewSchedule.ScheduleDate:HH:mm}";

                // Save notification in database
                await _notificationRepo.AddNotification(new Notification
                {
                    UserId = jobSeekerId,
                    Title = "Interview Reminder",
                    Message = message
                });

                await _notificationRepo.SaveChangesAsync();
            }
        }
    }
}
