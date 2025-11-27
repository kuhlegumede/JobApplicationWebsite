using AutoMapper;
using Job_Application.Dto;
using Job_Application.Models;
using System.Text.Json;

namespace Job_Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // RegistrationDto → User
            CreateMap<RegistrationDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

            // User → UserDto
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.UserRole, opt => opt.MapFrom(src => src.UserRole.ToString()));

            // UserDto → User
            CreateMap<UserDto, User>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserRole, opt => opt.MapFrom(src => Enum.Parse<UserRole>((string)src.UserRole)));

            // Employer mappings
            CreateMap<CreateEmployerDto, Employer>()
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<Employer, EmployerDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ReverseMap()
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // JobSeeker mappings
            CreateMap<CreateJobSeekerDto, JobSeeker>()
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.ResumeFile, opt => opt.Ignore());

            CreateMap<JobSeeker, JobSeekerDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.ResumeFile, opt => opt.MapFrom(src => src.ResumeFile))
                .ReverseMap()
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.ResumeFile, opt => opt.Ignore());

            // Job Application
            CreateMap<CreateJobApplicationDto, JobApplication>()
                .ForMember(dest => dest.DateApplied, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdated, opt => opt.Ignore())
                .ForMember(dest => dest.ApplicationStatus, opt => opt.Ignore())
                .ForMember(dest => dest.JobSeeker, opt => opt.Ignore())
                .ForMember(dest => dest.JobPost, opt => opt.Ignore())
                .ForMember(dest => dest.InterviewSchedule, opt => opt.Ignore());

            CreateMap<JobApplication, JobApplicationDto>().ReverseMap()
                .ForMember(dest => dest.JobSeeker, opt => opt.Ignore())
                .ForMember(dest => dest.JobPost, opt => opt.Ignore())
                .ForMember(dest => dest.InterviewSchedule, opt => opt.Ignore());

            // JobPost
            CreateMap<CreateJobPostDto, JobPost>()
                .ForMember(dest => dest.PostedDate, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Employer, opt => opt.Ignore())
                .ForMember(dest => dest.JobApplications, opt => opt.Ignore());

            CreateMap<JobPost, JobPostDto>().ReverseMap()
                .ForMember(dest => dest.Employer, opt => opt.Ignore())
                .ForMember(dest => dest.JobApplications, opt => opt.Ignore());

            // Message
            CreateMap<CreateMessageDto, Message>()
                .ForMember(dest => dest.SentAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsRead, opt => opt.Ignore())
                .ForMember(dest => dest.Sender, opt => opt.Ignore())
                .ForMember(dest => dest.Receiver, opt => opt.Ignore());

            CreateMap<Message, MessageDto>().ReverseMap()
                .ForMember(dest => dest.Sender, opt => opt.Ignore())
                .ForMember(dest => dest.Receiver, opt => opt.Ignore());

            // Interview Schedule
            CreateMap<InterviewSchedule, InterviewScheduleDto>()
                .ForMember(dest => dest.InterviewMode, opt => opt.MapFrom(src => src.Mode.ToString()))
                .ReverseMap()
                .ForMember(dest => dest.Mode, opt => opt.MapFrom(src => Enum.Parse<InterviewMode>(src.InterviewMode)))
                .ForMember(dest => dest.JobApplication, opt => opt.Ignore());

            CreateMap<CreateInterviewScheduleDto, InterviewSchedule>()
                .ForMember(dest => dest.Mode, opt => opt.MapFrom(src => Enum.Parse<InterviewMode>(src.InterviewMode)))
                .ForMember(dest => dest.JobApplication, opt => opt.Ignore());

            // Admin
            CreateMap<Admin, AdminDto>().ReverseMap()
                .ForMember(dest => dest.User, opt => opt.Ignore());

            CreateMap<CreateAdminDto, Admin>()
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // File mappings
            CreateMap<UploadedFile, FileUploadDto>()
                .ForMember(dest => dest.FileId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.FilePath, opt => opt.MapFrom(src => src.FilePath));

            CreateMap<UploadedFile, FileInfoDto>()
                .ForMember(dest => dest.FileId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.IsAccessible, opt => opt.Ignore()); // Set manually based on file existence

            // Assessment mappings
            CreateMap<Assessment, AssessmentDto>()
                .ForMember(dest => dest.EmployerName, opt => opt.Ignore());

            CreateMap<AssessmentQuestion, AssessmentQuestionDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.Options, opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.Options) ? null : JsonSerializer.Deserialize<List<string>>(src.Options, (JsonSerializerOptions)null)));

            CreateMap<CreateAssessmentQuestionDto, AssessmentQuestion>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<QuestionType>(src.Type, true)))
                .ForMember(dest => dest.Options, opt => opt.MapFrom(src =>
                    src.Options == null || src.Options.Count == 0 ? null : JsonSerializer.Serialize(src.Options, (JsonSerializerOptions)null)))
                .ForMember(dest => dest.Assessment, opt => opt.Ignore());

            // Assessment Assignment mappings
            CreateMap<AssessmentAssignment, AssessmentAssignmentDto>()
                .ForMember(dest => dest.AssessmentTitle, opt => opt.MapFrom(src => src.Assessment != null ? src.Assessment.Title : ""))
                .ForMember(dest => dest.AssessmentDescription, opt => opt.MapFrom(src => src.Assessment != null ? src.Assessment.Description : null))
                .ForMember(dest => dest.EmployerName, opt => opt.MapFrom(src => 
                    src.Assessment != null && src.Assessment.Employer != null ? src.Assessment.Employer.CompanyName : "Unknown"))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => 
                    src.Assessment != null && src.Assessment.Questions != null ? src.Assessment.Questions : null))
                .ForMember(dest => dest.SubmittedResponses, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.Responses) ? JsonSerializer.Deserialize<Dictionary<int, string>>(src.Responses, (JsonSerializerOptions)null) : null));

            // FAQ mappings
            CreateMap<FAQ, FaqDto>().ReverseMap();
            CreateMap<CreateFaqDto, FAQ>()
                .ForMember(dest => dest.FaqId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByAdminId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());
            CreateMap<UpdateFaqDto, FAQ>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByAdminId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

            // Notification mappings
            CreateMap<Notification, NotificationResponseDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.NotificationType.ToString()))
                .ForMember(dest => dest.RelatedEntityId, opt => opt.Ignore())
                .ForMember(dest => dest.RelatedEntityType, opt => opt.Ignore());
        }
    }
}
