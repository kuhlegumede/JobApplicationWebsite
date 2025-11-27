using System.Text.Json.Serialization;

namespace Job_Application.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum NotificationType
    {
        UserSpecific = 0,
        SystemWide = 1,
        RoleSpecific = 2
    }
}
