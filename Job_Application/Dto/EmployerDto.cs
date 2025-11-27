using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class EmployerDto
    {
        public int EmployerId {  get; set; }
        public int UserId { get; set; }
        public UserDto User { get; set; }

        [Required(ErrorMessage = "Company name is required.")]
        [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters.")]
        public string CompanyName {  get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string CompanyDescription {  get; set; }


        [Required(ErrorMessage = "Location is required.")]
        [StringLength(300, ErrorMessage = "Location cannot exceed 300 characters")]
        public string Location {  get; set; }

        [Url(ErrorMessage = "Please enter a valid website URL")]
        public string Website {  get; set; }

        public int? CompanyLogoFileId { get; set; }          // Foreign key to UploadedFile for company logo
        public FileInfoDto CompanyLogoFile { get; set; }     // Company logo file information
    }
}
