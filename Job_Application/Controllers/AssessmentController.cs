using AutoMapper;
using Job_Application.Dto;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<AssessmentController> _logger;
        private readonly INotificationRepository _notificationRepository;
        private readonly IJobSeekerRepository _jobSeekerRepository;

        public AssessmentController(
            IAssessmentRepository repository, 
            IMapper mapper, 
            ILogger<AssessmentController> logger,
            INotificationRepository notificationRepository,
            IJobSeekerRepository jobSeekerRepository)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
            _notificationRepository = notificationRepository;
            _jobSeekerRepository = jobSeekerRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssessmentDto>>> GetAllAssessments()
        {
            var assessments = await _repository.GetAllAssessments();
            var assessmentDtos = new List<AssessmentDto>();

            foreach (var assessment in assessments)
            {
                var dto = _mapper.Map<AssessmentDto>(assessment);
                if (assessment.Employer?.User != null)
                {
                    dto.EmployerName = assessment.Employer.CompanyName;
                }
                assessmentDtos.Add(dto);
            }

            return Ok(assessmentDtos);
        }

        [HttpGet("employer/{employerId}")]
        public async Task<ActionResult<IEnumerable<AssessmentDto>>> GetAssessmentsByEmployerId(int employerId)
        {
            var assessments = await _repository.GetAssessmentsByEmployerId(employerId);
            return Ok(_mapper.Map<IEnumerable<AssessmentDto>>(assessments));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AssessmentDto>> GetAssessmentById(int id)
        {
            var assessment = await _repository.GetAssessmentById(id);
            if (assessment == null)
            {
                return NotFound();
            }

            var dto = _mapper.Map<AssessmentDto>(assessment);
            if (assessment.Employer?.User != null)
            {
                dto.EmployerName = assessment.Employer.CompanyName;
            }

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Employer")]
        public async Task<ActionResult<AssessmentDto>> CreateAssessment(CreateAssessmentDto dto)
        {
            try
            {
                // Get employer ID from claims
                var userIdClaim = User.FindFirst("UserId");
                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found in token");
                }
                int userId = int.Parse(userIdClaim.Value);

                var employerIdClaim = User.FindFirst("EmployerId");
                if (employerIdClaim == null)
                {
                    return Unauthorized("Employer ID not found in token");
                }
                int employerId = int.Parse(employerIdClaim.Value);

                _logger.LogInformation("Creating assessment for employer {EmployerId}", employerId);
                _logger.LogInformation("Assessment details - Title: {Title}, Description: {Description}, Questions: {QuestionCount}", 
                    dto.Title, dto.Description, dto.Questions.Count);

                var assessment = new Assessment
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    EmployerId = employerId,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Questions = new List<AssessmentQuestion>()
                };

                _logger.LogInformation("Assessment object created, adding questions...");

                foreach (var questionDto in dto.Questions)
                {
                    _logger.LogInformation("Adding question: {QuestionText}, Type: {Type}", 
                        questionDto.QuestionText, questionDto.Type);
                    
                    var question = new AssessmentQuestion
                    {
                        QuestionText = questionDto.QuestionText,
                        OrderIndex = questionDto.OrderIndex,
                        Type = Enum.Parse<QuestionType>(questionDto.Type, true)
                    };

                    // Serialize options if provided and not empty
                    if (questionDto.Options != null && questionDto.Options.Count > 0)
                    {
                        question.Options = JsonSerializer.Serialize(questionDto.Options);
                        _logger.LogInformation("Question has {OptionCount} options", questionDto.Options.Count);
                    }
                    else
                    {
                        question.Options = null; // Explicitly set to null for empty/missing options
                        _logger.LogInformation("Question has no options (set to null)");
                    }

                    assessment.Questions.Add(question);
                }

                _logger.LogInformation("All questions added, saving assessment with {QuestionCount} questions", assessment.Questions.Count);

                var created = await _repository.CreateAssessment(assessment);
                
                _logger.LogInformation("Assessment created with ID: {AssessmentId}", created.AssessmentId);
                
                // Reload to get navigation properties before creating assignments
                var fullAssessment = await _repository.GetAssessmentById(created.AssessmentId);
                
                // Create assignments if job seeker IDs are provided (done after assessment is saved)
                if (dto.JobSeekerIds != null && dto.JobSeekerIds.Count > 0)
                {
                    _logger.LogInformation("Creating {AssignmentCount} assignments", dto.JobSeekerIds.Count);
                    
                    foreach (var jobSeekerId in dto.JobSeekerIds)
                    {
                        try
                        {
                            var assignment = new AssessmentAssignment
                            {
                                AssessmentId = created.AssessmentId,
                                JobSeekerId = jobSeekerId,
                                AssignedAt = DateTime.UtcNow,
                                Status = AssessmentStatus.Pending
                            };
                            await _repository.CreateAssignment(assignment);
                            _logger.LogInformation("Created assignment for job seeker {JobSeekerId}", jobSeekerId);
                            
                            // Send notification to job seeker
                            try
                            {
                                // Get the job seeker's user ID
                                var jobSeeker = await _jobSeekerRepository.GetJobSeekerById(jobSeekerId);
                                if (jobSeeker != null)
                                {
                                    var notification = new Notification
                                    {
                                        UserId = jobSeeker.UserId,
                                        Title = "New Assessment Assigned",
                                        Message = $"You have been assigned a new assessment: '{assessment.Title}'. Please complete it at your earliest convenience.",
                                        IsRead = false,
                                        CreatedAt = DateTime.UtcNow
                                    };
                                    
                                    await _notificationRepository.AddNotification(notification);
                                    await _notificationRepository.SaveChangesAsync();
                                    
                                    _logger.LogInformation("Notification sent to job seeker {JobSeekerId} (User {UserId})", 
                                        jobSeekerId, jobSeeker.UserId);
                                }
                            }
                            catch (Exception notifEx)
                            {
                                _logger.LogError(notifEx, "Failed to send notification to job seeker {JobSeekerId}", jobSeekerId);
                                // Don't fail the whole operation if notification fails
                            }
                        }
                        catch (Exception assignEx)
                        {
                            _logger.LogError(assignEx, "Failed to create assignment for job seeker {JobSeekerId}. InnerException: {InnerException}", 
                                jobSeekerId, assignEx.InnerException?.Message);
                            // Continue with other assignments even if one fails
                        }
                    }
                }
                
                return CreatedAtAction(
                    nameof(GetAssessmentById),
                    new { id = created.AssessmentId },
                    _mapper.Map<AssessmentDto>(fullAssessment)
                );
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error creating assessment. Inner exception: {InnerException}", 
                    dbEx.InnerException?.Message);
                return BadRequest(new { 
                    message = "Database error creating assessment", 
                    error = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating assessment. Details: {Message}, InnerException: {InnerException}", 
                    ex.Message, ex.InnerException?.Message);
                return BadRequest(new { 
                    message = "Error creating assessment", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message 
                });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateAssessment(int id, CreateAssessmentDto dto)
        {
            var assessment = await _repository.GetAssessmentById(id);
            if (assessment == null)
            {
                return NotFound();
            }

            // Check if user owns this assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || int.Parse(employerIdClaim.Value) != assessment.EmployerId)
            {
                return Forbid();
            }

            assessment.Title = dto.Title;
            assessment.Description = dto.Description;

            await _repository.UpdateAssessment(assessment);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> DeleteAssessment(int id)
        {
            var assessment = await _repository.GetAssessmentById(id);
            if (assessment == null)
            {
                return NotFound();
            }

            // Check if user owns this assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || int.Parse(employerIdClaim.Value) != assessment.EmployerId)
            {
                return Forbid();
            }

            await _repository.DeleteAssessment(assessment);
            return NoContent();
        }

        [HttpPut("{id}/toggle-active")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var assessment = await _repository.GetAssessmentById(id);
            if (assessment == null)
            {
                return NotFound();
            }

            // Check if user owns this assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || int.Parse(employerIdClaim.Value) != assessment.EmployerId)
            {
                return Forbid();
            }

            assessment.IsActive = !assessment.IsActive;
            await _repository.UpdateAssessment(assessment);
            
            return Ok(new { isActive = assessment.IsActive });
        }

        // Assessment Assignment endpoints
        [HttpPost("{assessmentId}/assign/{jobSeekerId}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> AssignAssessment(int assessmentId, int jobSeekerId)
        {
            var assessment = await _repository.GetAssessmentById(assessmentId);
            if (assessment == null)
            {
                return NotFound("Assessment not found");
            }

            // Check if user owns this assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || int.Parse(employerIdClaim.Value) != assessment.EmployerId)
            {
                return Forbid();
            }

            var assignment = new AssessmentAssignment
            {
                AssessmentId = assessmentId,
                JobSeekerId = jobSeekerId,
                AssignedAt = DateTime.UtcNow,
                Status = AssessmentStatus.Pending
            };

            var created = await _repository.CreateAssignment(assignment);
            return Ok(created);
        }

        [HttpGet("{assessmentId}/assignments")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> GetAssessmentAssignments(int assessmentId)
        {
            var assessment = await _repository.GetAssessmentById(assessmentId);
            if (assessment == null)
            {
                return NotFound("Assessment not found");
            }

            // Check if user owns this assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || int.Parse(employerIdClaim.Value) != assessment.EmployerId)
            {
                return Forbid();
            }

            var assignments = await _repository.GetAssignmentsByAssessmentId(assessmentId);
            return Ok(assignments);
        }

        [HttpGet("my-assessments")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> GetMyAssignedAssessments()
        {
            var jobSeekerIdClaim = User.FindFirst("JobSeekerId");
            if (jobSeekerIdClaim == null)
            {
                return Unauthorized("Job seeker ID not found in token");
            }
            int jobSeekerId = int.Parse(jobSeekerIdClaim.Value);

            var assignments = await _repository.GetAssignmentsByJobSeekerId(jobSeekerId);
            
            // Map to AssessmentAssignmentDto
            var assignmentDtos = new List<AssessmentAssignmentDto>();
            foreach (var assignment in assignments)
            {
                var dto = new AssessmentAssignmentDto
                {
                    AssignmentId = assignment.AssignmentId,
                    AssessmentId = assignment.AssessmentId,
                    AssessmentTitle = assignment.Assessment?.Title ?? "",
                    AssessmentDescription = assignment.Assessment?.Description,
                    EmployerName = assignment.Assessment?.Employer?.CompanyName ?? "Unknown",
                    Status = assignment.Status.ToString(),
                    AssignedAt = assignment.AssignedAt,
                    CompletedAt = assignment.CompletedAt,
                    Score = assignment.Score,
                    Questions = assignment.Assessment?.Questions?
                        .Select(q => _mapper.Map<AssessmentQuestionDto>(q))
                        .ToList()
                };

                // Parse submitted responses if completed
                if (!string.IsNullOrEmpty(assignment.Responses))
                {
                    try
                    {
                        dto.SubmittedResponses = JsonSerializer.Deserialize<Dictionary<int, string>>(assignment.Responses);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error parsing responses for assignment {AssignmentId}", assignment.AssignmentId);
                    }
                }

                assignmentDtos.Add(dto);
            }

            return Ok(assignmentDtos);
        }

        [HttpGet("assignment/{assignmentId}")]
        [Authorize(Roles = "JobSeeker,Employer")]
        public async Task<IActionResult> GetAssignmentById(int assignmentId)
        {
            var assignment = await _repository.GetAssignmentByIdWithDetails(assignmentId);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            // Authorization check
            var jobSeekerIdClaim = User.FindFirst("JobSeekerId");
            var employerIdClaim = User.FindFirst("EmployerId");

            bool isJobSeeker = jobSeekerIdClaim != null && int.Parse(jobSeekerIdClaim.Value) == assignment.JobSeekerId;
            bool isEmployer = employerIdClaim != null && 
                             assignment.Assessment != null && 
                             int.Parse(employerIdClaim.Value) == assignment.Assessment.EmployerId;

            if (!isJobSeeker && !isEmployer)
            {
                return Forbid();
            }

            // Map to AssessmentAssignmentDto
            var dto = new AssessmentAssignmentDto
            {
                AssignmentId = assignment.AssignmentId,
                AssessmentId = assignment.AssessmentId,
                AssessmentTitle = assignment.Assessment?.Title ?? "",
                AssessmentDescription = assignment.Assessment?.Description,
                EmployerName = assignment.Assessment?.Employer?.CompanyName ?? "Unknown",
                Status = assignment.Status.ToString(),
                AssignedAt = assignment.AssignedAt,
                CompletedAt = assignment.CompletedAt,
                Score = assignment.Score,
                Questions = assignment.Assessment?.Questions?
                    .Select(q => _mapper.Map<AssessmentQuestionDto>(q))
                    .ToList()
            };

            // Parse submitted responses if completed
            if (!string.IsNullOrEmpty(assignment.Responses))
            {
                try
                {
                    dto.SubmittedResponses = JsonSerializer.Deserialize<Dictionary<int, string>>(assignment.Responses);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error parsing responses for assignment {AssignmentId}", assignmentId);
                }
            }

            return Ok(dto);
        }

        [HttpPut("assignment/{assignmentId}/start")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> StartAssessment(int assignmentId)
        {
            var assignment = await _repository.GetAssignmentById(assignmentId);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            // Check if job seeker owns this assignment
            var jobSeekerIdClaim = User.FindFirst("JobSeekerId");
            if (jobSeekerIdClaim == null || int.Parse(jobSeekerIdClaim.Value) != assignment.JobSeekerId)
            {
                return Forbid();
            }

            // Only allow starting if status is Pending
            if (assignment.Status != AssessmentStatus.Pending)
            {
                return BadRequest(new { message = $"Cannot start assessment with status: {assignment.Status}" });
            }

            assignment.Status = AssessmentStatus.InProgress;
            await _repository.UpdateAssignment(assignment);

            return Ok(new { message = "Assessment started", status = assignment.Status.ToString() });
        }

        [HttpPost("assignment/{assignmentId}/submit")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> SubmitAssessment(int assignmentId, [FromBody] SubmitAssessmentDto dto)
        {
            try
            {
                var assignment = await _repository.GetAssignmentByIdWithDetails(assignmentId);
                if (assignment == null)
                {
                    return NotFound("Assignment not found");
                }

                // Check if job seeker owns this assignment
                var jobSeekerIdClaim = User.FindFirst("JobSeekerId");
                if (jobSeekerIdClaim == null || int.Parse(jobSeekerIdClaim.Value) != assignment.JobSeekerId)
                {
                    return Forbid();
                }

                // Validate assignment is not already completed
                if (assignment.Status == AssessmentStatus.Completed || assignment.Status == AssessmentStatus.Reviewed)
                {
                    return BadRequest(new { message = "Assessment has already been submitted" });
                }

                // Validate all questions are answered
                var questionIds = assignment.Assessment?.Questions?.Select(q => q.QuestionId).ToList() ?? new List<int>();
                var answeredQuestionIds = dto.Responses.Keys.ToList();

                var missingQuestions = questionIds.Where(id => !answeredQuestionIds.Contains(id)).ToList();
                if (missingQuestions.Any())
                {
                    return BadRequest(new { 
                        message = "All questions must be answered", 
                        missingQuestionIds = missingQuestions 
                    });
                }

                // Save responses
                assignment.Responses = JsonSerializer.Serialize(dto.Responses);
                assignment.Status = AssessmentStatus.Completed;
                assignment.CompletedAt = DateTime.UtcNow;

                await _repository.UpdateAssignment(assignment);

                _logger.LogInformation("Job seeker {JobSeekerId} submitted assessment assignment {AssignmentId}", 
                    assignment.JobSeekerId, assignmentId);

                return Ok(new { 
                    message = "Assessment submitted successfully",
                    assignmentId = assignment.AssignmentId,
                    status = assignment.Status.ToString(),
                    completedAt = assignment.CompletedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting assessment {AssignmentId}", assignmentId);
                return BadRequest(new { message = "Error submitting assessment", error = ex.Message });
            }
        }

        [HttpGet("{assessmentId}/submissions")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> GetAssessmentSubmissions(int assessmentId)
        {
            var assessment = await _repository.GetAssessmentById(assessmentId);
            if (assessment == null)
            {
                return NotFound("Assessment not found");
            }

            // Check if employer owns this assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || int.Parse(employerIdClaim.Value) != assessment.EmployerId)
            {
                return Forbid();
            }

            var assignments = await _repository.GetAssignmentsByAssessmentId(assessmentId);

            // Map to AssessmentResponseDto
            var responseDtos = new List<AssessmentResponseDto>();
            foreach (var assignment in assignments)
            {
                var dto = new AssessmentResponseDto
                {
                    AssignmentId = assignment.AssignmentId,
                    JobSeekerId = assignment.JobSeekerId,
                    JobSeekerName = $"{assignment.JobSeeker?.User?.FirstName} {assignment.JobSeeker?.User?.LastName}",
                    JobSeekerEmail = assignment.JobSeeker?.User?.Email ?? "",
                    AssessmentTitle = assessment.Title,
                    Status = assignment.Status.ToString(),
                    AssignedAt = assignment.AssignedAt,
                    CompletedAt = assignment.CompletedAt,
                    Score = assignment.Score
                };

                // Parse and map responses if completed
                if (!string.IsNullOrEmpty(assignment.Responses) && assessment.Questions != null)
                {
                    try
                    {
                        var responses = JsonSerializer.Deserialize<Dictionary<int, string>>(assignment.Responses);
                        dto.Responses = new List<QuestionResponseDto>();

                        foreach (var question in assessment.Questions.OrderBy(q => q.OrderIndex))
                        {
                            var questionResponse = new QuestionResponseDto
                            {
                                QuestionId = question.QuestionId,
                                QuestionText = question.QuestionText,
                                QuestionType = question.Type.ToString(),
                                OrderIndex = question.OrderIndex,
                                Answer = responses != null && responses.ContainsKey(question.QuestionId) 
                                    ? responses[question.QuestionId] 
                                    : null
                            };

                            // Add options for multiple choice questions
                            if (!string.IsNullOrEmpty(question.Options))
                            {
                                try
                                {
                                    questionResponse.Options = JsonSerializer.Deserialize<List<string>>(question.Options);
                                }
                                catch { }
                            }

                            dto.Responses.Add(questionResponse);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error parsing responses for assignment {AssignmentId}", assignment.AssignmentId);
                    }
                }

                responseDtos.Add(dto);
            }

            return Ok(responseDtos);
        }

        [HttpPut("assignment/{assignmentId}/score")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateAssignmentScore(int assignmentId, [FromBody] UpdateScoreDto dto)
        {
            var assignment = await _repository.GetAssignmentByIdWithDetails(assignmentId);
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }

            // Check if employer owns the assessment
            var employerIdClaim = User.FindFirst("EmployerId");
            if (employerIdClaim == null || 
                assignment.Assessment == null || 
                int.Parse(employerIdClaim.Value) != assignment.Assessment.EmployerId)
            {
                return Forbid();
            }

            // Validate assignment is completed
            if (assignment.Status != AssessmentStatus.Completed && assignment.Status != AssessmentStatus.Reviewed)
            {
                return BadRequest(new { message = "Can only score completed assessments" });
            }

            assignment.Score = dto.Score;
            assignment.Status = AssessmentStatus.Reviewed;
            await _repository.UpdateAssignment(assignment);

            _logger.LogInformation("Employer {EmployerId} scored assignment {AssignmentId} with {Score}", 
                assignment.Assessment.EmployerId, assignmentId, dto.Score);

            // Send notification to job seeker about score
            try
            {
                var jobSeeker = await _jobSeekerRepository.GetJobSeekerById(assignment.JobSeekerId);
                if (jobSeeker != null)
                {
                    var notification = new Notification
                    {
                        UserId = jobSeeker.UserId,
                        Title = "Assessment Reviewed",
                        Message = $"Your assessment '{assignment.Assessment.Title}' has been reviewed. Score: {dto.Score}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    
                    await _notificationRepository.AddNotification(notification);
                    await _notificationRepository.SaveChangesAsync();
                    
                    _logger.LogInformation("Score notification sent to job seeker {JobSeekerId}", assignment.JobSeekerId);
                }
            }
            catch (Exception notifEx)
            {
                _logger.LogError(notifEx, "Failed to send score notification to job seeker {JobSeekerId}", assignment.JobSeekerId);
                // Don't fail the operation if notification fails
            }

            return Ok(new { 
                message = "Score updated successfully",
                assignmentId = assignment.AssignmentId,
                score = assignment.Score,
                status = assignment.Status.ToString()
            });
        }
    }
}
