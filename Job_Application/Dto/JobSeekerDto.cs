using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class JobSeekerDto
    {
        public int JobSeekerId {  get; set; }

        public int UserId { get; set; }
        public UserDto User { get; set; }
  
        public int? ResumeFileId { get; set; }               // Foreign key to UploadedFile
        public FileInfoDto ResumeFile { get; set; }          // File information

        public int? ProfilePictureFileId { get; set; }       // Foreign key to UploadedFile for profile picture
        public FileInfoDto ProfilePictureFile { get; set; }  // Profile picture file information
        
        [Required(ErrorMessage = "Skills are required.")]
        [StringLength(500, ErrorMessage = "skills cannot exceed 500 characters.")]
        public string Skills {  get; set; }
        public string Experience {  get; set; }

        [Required(ErrorMessage = "Education is required.")]
        [StringLength(500, ErrorMessage = "Education cannot exceed 500 characters.")]
        public string Education {  get; set; }

        [StringLength(1000, ErrorMessage = "Cover letter cannot excceed 1000 characters.")]
        public string CoverLetter {  get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber {  get; set; }


    }
}
