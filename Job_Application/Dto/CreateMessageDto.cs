using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class CreateMessageDto
    {
        // SenderId will be extracted from JWT token, not from request body
        public int? SenderId { get; set; }

        [Required(ErrorMessage = "Receiver ID is required.")]
        public int ReceiverId {  get; set; }

        [Required(ErrorMessage = "Message content cannot be empty.")]
        [StringLength(2000, ErrorMessage = "Message content cannot exceed 2000 characters.")]
        public string Content {  get; set; }

    }
}
