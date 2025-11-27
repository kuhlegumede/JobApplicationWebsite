using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    public class Message
    {
        [Key]
        public int MessageId {  get; set; }

        [Required]
        public int SenderId { get; set; } //FK to User
        [ForeignKey("SenderId")]
        public User Sender { get; set; }

        [Required]
        public int ReceiverId {  get; set; } //FK to User

        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; }

        [Required(ErrorMessage = "Message content cannot be empty.")]
        [StringLength(2000, ErrorMessage = "Message cannot exceed 2000 characters.")]
        public string Content {  get; set; }

        [Required]
        public DateTime SentAt { get; set; }

        public bool IsRead { get; set; } = false; //default
    }
}
