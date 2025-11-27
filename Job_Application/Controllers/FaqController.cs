using AutoMapper;
using Job_Application.Dto;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Job_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FaqController : ControllerBase
    {
        private readonly IFaqRepository _repository;
        private readonly IMapper _mapper;

        public FaqController(IFaqRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // Helper method to get Admin ID from claims
        private int GetAdminId()
        {
            var adminIdClaim = User.FindFirst("AdminId")?.Value;
            return int.Parse(adminIdClaim ?? "0");
        }

        //PUBLIC ENDPOINTS
        [HttpGet("published")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FaqDto>>> GetPublishedFaqs()
        {
            var faqs = await _repository.GetPublishedFaqs();
            return Ok(_mapper.Map<IEnumerable<FaqDto>>(faqs));
        }

        [HttpGet("published/category/{category}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FaqDto>>> GetPublishedFaqsByCategory(FaqCategory category)
        {
            var faqs = await _repository.GetFaqsByCategory(category);
            return Ok(_mapper.Map<IEnumerable<FaqDto>>(faqs));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<FaqDto>> GetFaqById(int id)
        {
            var faq = await _repository.GetFaqById(id);
            if (faq == null)
            {
                return NotFound(new { message = "FAQ not found" });
            }

            // Only return if published (unless admin)
            if (!faq.IsPublished && !User.IsInRole("Admin"))
            {
                return NotFound(new { message = "FAQ not found" });
            }

            return Ok(_mapper.Map<FaqDto>(faq));
        }

        //  ADMIN ENDPOINTS
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FaqDto>>> GetAllFaqs()
        {
            var faqs = await _repository.GetAllFaqs();
            return Ok(_mapper.Map<IEnumerable<FaqDto>>(faqs));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<FaqDto>> CreateFaq([FromBody] CreateFaqDto dto)
        {
            var adminId = GetAdminId();

            if (adminId == 0)
            {
                return Unauthorized(new { message = "Admin ID not found in token" });
            }

            var faq = new FAQ
            {
                Question = dto.Question,
                Answer = dto.Answer,
                Category = dto.Category,
                DisplayOrder = dto.DisplayOrder,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow,
                CreatedByAdminId = adminId
            };

            await _repository.CreateFaq(faq);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetFaqById),
                new { id = faq.FaqId },
                _mapper.Map<FaqDto>(faq)
            );
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFaq(int id, [FromBody] UpdateFaqDto dto)
        {
            if (id != dto.FaqId)
            {
                return BadRequest(new { message = "FAQ ID mismatch" });
            }

            var faq = await _repository.GetFaqById(id);
            if (faq == null)
            {
                return NotFound(new { message = "FAQ not found" });
            }

            faq.Question = dto.Question;
            faq.Answer = dto.Answer;
            faq.Category = dto.Category;
            faq.DisplayOrder = dto.DisplayOrder;
            faq.IsPublished = dto.IsPublished;
            faq.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateFaq(faq);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFaq(int id)
        {
            var faq = await _repository.GetFaqById(id);
            if (faq == null)
            {
                return NotFound(new { message = "FAQ not found" });
            }

            await _repository.DeleteFaq(faq);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> PublishFaq(int id)
        {
            var faq = await _repository.GetFaqById(id);
            if (faq == null)
            {
                return NotFound(new { message = "FAQ not found" });
            }

            faq.IsPublished = true;
            faq.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateFaq(faq);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "FAQ published successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/unpublish")]
        public async Task<IActionResult> UnpublishFaq(int id)
        {
            var faq = await _repository.GetFaqById(id);
            if (faq == null)
            {
                return NotFound(new { message = "FAQ not found" });
            }

            faq.IsPublished = false;
            faq.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateFaq(faq);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "FAQ unpublished successfully" });
        }
    }
}
