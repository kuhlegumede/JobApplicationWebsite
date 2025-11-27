using System.ComponentModel.DataAnnotations;
namespace Job_Application.Dto
{
    public class MessageDto
    {
        public int MessageId {  get; set; }
        public int SenderId {  get; set; }
        public int ReceiverId {  get; set; }
        public string Content {  get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead {  get; set; }

    }
}
