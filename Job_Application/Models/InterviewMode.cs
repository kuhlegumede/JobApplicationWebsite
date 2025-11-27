using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Job_Application.Interfaces;

namespace Job_Application.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))] //(ensures enums are serialized as string names)
    public enum InterviewMode
    {
        InPerson,
        Online,
        Phone
    }
}
