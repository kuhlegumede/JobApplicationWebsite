using System.Text.Json.Serialization;

namespace Job_Application.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EmployerApprovalStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
