using System.Text.Json.Serialization;

namespace Job_Application.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AccountActionType
    {
        Deactivated = 0,
        Reactivated = 1,
        PasswordReset = 2,
        RoleChanged = 3,
        EmployerApproved = 4,
        EmployerRejected = 5,
        JobPostRemoved = 6,
        JobPostRestored = 7
    }
}
