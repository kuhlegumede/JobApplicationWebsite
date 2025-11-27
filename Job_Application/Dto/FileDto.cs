namespace Job_Application.Dto
{
    public class FileUploadDto
    {
        public int FileId { get; set; }
        public string OriginalFileName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; }
        public DateTime UploadDate { get; set; }
        public string FileCategory { get; set; }
        public string Message { get; set; } = "File uploaded successfully";
    }

    public class FileInfoDto
    {
        public int FileId { get; set; }
        public string OriginalFileName { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; }
        public DateTime UploadDate { get; set; }
        public string FileCategory { get; set; }
        public bool IsAccessible { get; set; }
    }

    public class FileUploadResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public FileUploadDto FileData { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    public class Base64ImageDto
    {
        public string Base64String { get; set; }
        public string FileName { get; set; } = "camera-capture.jpg";
        public string ContentType { get; set; } = "image/jpeg";
    }
}