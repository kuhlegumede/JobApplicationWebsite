using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateAdminDto
    {
        [Required(ErrorMessage = "UserId is required")]
        public int UserId {  get; set; }
    }
}
