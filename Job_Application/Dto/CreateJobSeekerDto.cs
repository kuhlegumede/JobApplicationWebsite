using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateJobSeekerDto
    {
        public int UserId {  get; set; }

        public int? ResumeFileId { get; set; }              // Foreign key to UploadedFile (optional on creation)
        
        public int? ProfilePictureFileId { get; set; }      // Foreign key to UploadedFile for profile picture (optional)

        [Required(ErrorMessage = "Skills are required.")]
        [StringLength(500, ErrorMessage = "Skills cannot exceed 500 characters.")]
        public string Skills {  get; set; }
        public string Experience {  get; set; }

        [Required(ErrorMessage = "Education details are required.")]
        [StringLength(500, ErrorMessage = "Education details cannot exceed 500 characters.")]
        public string Education {  get; set; }

        [StringLength(1000, ErrorMessage = "Cover letter cannot exceed 1000 characters.")]
        public string CoverLetter {  get; set; }

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber {  get; set; }

    }
}
