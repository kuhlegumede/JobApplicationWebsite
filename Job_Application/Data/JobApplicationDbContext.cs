using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
namespace Job_Application.Data
{
    public class JobApplicationDbContext : DbContext
    {
        public JobApplicationDbContext(DbContextOptions<JobApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<User>Users { get; set; }
        public DbSet<JobSeeker> JobSeekers { get; set; }
        public DbSet<Employer> Employers { get; set; }
        public DbSet<JobPost> JobPosts { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<InterviewSchedule> InterviewSchedules { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UploadedFile> UploadedFiles { get; set; }
        public DbSet<Assessment> Assessments { get; set; }
        public DbSet<AssessmentQuestion> AssessmentQuestions { get; set; }
        public DbSet<AssessmentAssignment> AssessmentAssignments { get; set; }
        public DbSet<FAQ> FAQs { get; set; }
        public DbSet<AccountAction> AccountActions { get; set; }

        //Configuring model properties and relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>()
                .HasOne(a => a.Admin)
                .WithOne(u => u.User)
                .HasForeignKey<Admin>(u => u.UserId)
                .OnDelete(DeleteBehavior.Cascade)
               .IsRequired(false);

            modelBuilder.Entity<User>()
                .HasOne(u => u.JobSeeker)
                .WithOne(js =>js.User)
                .HasForeignKey<JobSeeker>(js =>js.UserId)
                .OnDelete(DeleteBehavior.Cascade) 
                .IsRequired(false);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Employer)
                .WithOne(e => e.User)
                .HasForeignKey<Employer>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade) 
                .IsRequired(false);

            modelBuilder.Entity<Employer>()
                .HasMany(e => e.JobPosts)
                .WithOne(jp => jp.Employer)
                .HasForeignKey(jp => jp.EmployerId)
                .OnDelete(DeleteBehavior.Restrict); //Prevents deleting loops
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<JobPost>()
                .HasMany(jp => jp.JobApplications)
                .WithOne(ja => ja.JobPost)
                .HasForeignKey(ja => ja.JobPostId)
                .OnDelete(DeleteBehavior.Restrict); //Prevents deleting loops

            modelBuilder.Entity<JobSeeker>()
                .HasMany(js =>js.JobApplications)
                .WithOne(ja =>ja.JobSeeker)
                .HasForeignKey(ja =>ja.JobSeekerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<JobApplication>()
                .HasOne(ja => ja.InterviewSchedule)
                .WithOne(i => i.JobApplication)
                .HasForeignKey<InterviewSchedule>(i => i.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict); //Prevents deleting loops

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict); //Prevents deleting loops

            modelBuilder.Entity<UploadedFile>()
                .HasOne(uf => uf.UploadedBy)
                .WithMany()
                .HasForeignKey(uf => uf.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict); //Prevents deleting loops

            modelBuilder.Entity<JobSeeker>()
                .HasOne(js => js.ResumeFile)
                .WithMany()
                .HasForeignKey(js => js.ResumeFileId)
                .OnDelete(DeleteBehavior.SetNull) //Set null when file is deleted
                .IsRequired(false);

            modelBuilder.Entity<Assessment>()
                .HasOne(a => a.Employer)
                .WithMany()
                .HasForeignKey(a => a.EmployerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AssessmentQuestion>()
                .HasOne(aq => aq.Assessment)
                .WithMany(a => a.Questions)
                .HasForeignKey(aq => aq.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AssessmentAssignment>()
                .HasOne(aa => aa.Assessment)
                .WithMany(a => a.Assignments)
                .HasForeignKey(aa => aa.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AssessmentAssignment>()
                .HasOne(aa => aa.JobSeeker)
                .WithMany()
                .HasForeignKey(aa => aa.JobSeekerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Admin Feature Relationships
            modelBuilder.Entity<Employer>()
                .HasOne(e => e.ApprovedBy)
                .WithMany()
                .HasForeignKey(e => e.ApprovedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<JobPost>()
                .HasOne(jp => jp.RemovedBy)
                .WithMany()
                .HasForeignKey(jp => jp.RemovedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FAQ>()
                .HasOne(f => f.CreatedBy)
                .WithMany()
                .HasForeignKey(f => f.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccountAction>()
                .HasOne(aa => aa.User)
                .WithMany()
                .HasForeignKey(aa => aa.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AccountAction>()
                .HasOne(aa => aa.PerformedBy)
                .WithMany()
                .HasForeignKey(aa => aa.PerformedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
