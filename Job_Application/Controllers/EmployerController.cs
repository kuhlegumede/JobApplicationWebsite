using AutoMapper;
using Job_Application.Dto;
using Job_Application.Models;
using Job_Application.Repositories;
using Job_Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Job_Application.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployerController : ControllerBase
    {
        private readonly IEmployerRepository _repository;
        private readonly IMapper _Mapper;

        public EmployerController(IEmployerRepository repository, IMapper mapper)
        {
            _repository = repository;
            _Mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployerDto>>>GetAllEmployers()
        {
            var employers = await _repository.GetAllEmployers();
            return Ok(_Mapper.Map<IEnumerable<EmployerDto>>(employers));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployerDto>> GetEmployerById(int id)
        {
            var employer = await _repository.GetEmployerById(id);
            if (employer == null)
            {
                return NotFound();
            }
            return Ok(_Mapper.Map<EmployerDto>(employer));
        }
        [HttpPost]
        [Authorize(Roles = "Admin, Employer")]
        public async Task<ActionResult<EmployerDto>> CreateEmployer(CreateEmployerDto dto)
        {
            var employer = _Mapper.Map<Employer>(dto);
            if(await _repository.GetEmployerById(employer.EmployerId) != null)
            {
                return BadRequest();
            }
            await _repository.CreateEmployer(employer);
            await _repository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEmployerById), new { id = employer.EmployerId }, _Mapper.Map<EmployerDto>(employer));
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Employer")]
        public async Task<IActionResult>UpdateEmployer(int id, EmployerDto dto)
        {
            var employer = await _repository.GetEmployerById(id);
            if(employer == null)
            {
                return NotFound();
            }
            _Mapper.Map(dto, employer);
           await  _repository.UpdateEmployer(employer);
            await _repository.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Employer")]
        public async Task<IActionResult>DeleteEmployer(int id)
        {
            var employer = await _repository.GetEmployerById(id);
            if (employer == null)
            {
               
                    return NotFound();
                
            }
           await  _repository.DeleteEmployer(employer);
            await _repository.SaveChangesAsync();
            return NoContent();
        }
    }
}
