using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    public class Admin
    {
        [Key]
        public int AdminId { get; set; }

        [ForeignKey("User")]
        public int UserId {  get; set; }
        public User User { get; set; }

    }
}
