using System.Text.Json.Serialization;

namespace Job_Application.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FaqCategory
    {
        General = 0,
        JobSeekers = 1,
        Employers = 2
    }
}
