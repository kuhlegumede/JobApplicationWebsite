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
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _repository;
        private readonly IMapper _mapper;

        public UserController(IUserRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>>GetAllUsers()
        {
            var users = await _repository.GetAllUsers();
                                            
            return Ok(_mapper.Map<IEnumerable<UserDto>>(users));
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>>GetUserById(int id)
        {
            var user = await _repository.GetUserById(id);
            if(user == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(_mapper.Map<UserDto>(user));
            }
        }
        [HttpPost]
        public async Task<ActionResult<UserDto>>CreateUser( RegistrationDto dto)
        {
            var user = _mapper.Map<User>(dto);
            await _repository.CreateUser(user, dto.Password);
            return CreatedAtAction(nameof(GetUserById), new {id = user.UserId}, _mapper.Map<UserDto>(user));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult>UpdateUser(int id, UserDto dto)
        {
            var user = await _repository.GetUserById(id);
            if(user == null)
            {
                return NotFound();
            }
            _mapper.Map(dto, user);
            await _repository.UpdateUser(user);
            await _repository.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult>DeleteUser(int id)
        {
            var user = await _repository.GetUserById(id);
            if(user == null)
            {
                return NotFound();
            }
            await _repository.DeleteUser(user);
            await _repository.SaveChangesAsync();
            return NoContent();
        }


    }
}
