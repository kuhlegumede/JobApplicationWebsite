using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Job_Application.Models
{
    public class UploadedFile
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string OriginalFileName { get; set; }     // User's original filename
        
        [Required]
        [StringLength(255)]
        public string StoredFileName { get; set; }       // Unique GUID-based filename
        
        [Required]
        [StringLength(500)]
        public string FilePath { get; set; }             // Relative path from upload root
        
        [Required]
        public long FileSize { get; set; }               // Size in bytes
        
        [Required]
        [StringLength(100)]
        public string ContentType { get; set; }          // MIME type
        
        [Required]
        public DateTime UploadDate { get; set; }         // Upload timestamp
        
        [Required]
        public int UploadedByUserId { get; set; }        // User who uploaded
        
        [Required]
        [StringLength(50)]
        public string FileCategory { get; set; }         // "CV", "ProfileImage", etc.
        
        // Navigation Properties
        [ForeignKey("UploadedByUserId")]
        public User UploadedBy { get; set; }
    }
}