using AutoMapper;
using Job_Application.Dto;
using Job_Application.Interfaces;
using Job_Application.Models;
using Job_Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


namespace Job_Application.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IMessageRepository _repository;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IUserRepository _userRepository;

        public MessageController(
            IMessageRepository repository, 
            IMapper _mapper, 
            INotificationService notificationService,
            IUserRepository userRepository)
        {
            _repository = repository;
            this._mapper = _mapper;
            _notificationService = notificationService;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetAllMessages()
        {
            var messages = await _repository.GetAllMessages();
            return Ok(_mapper.Map<IEnumerable<MessageDto>>(messages));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MessageDto>> GetMessageById(int id)
        {
            var message = await _repository.GetMessageById(id);
            if (message == null)
            {
                return NotFound();
            }
            return Ok(_mapper.Map<MessageDto>(message));
        }
        [Authorize]
        [HttpPost("send")]
        public async Task<ActionResult<MessageDto>> CreateMessage([FromBody] CreateMessageDto dto)
        {
            try
            {
                // Get sender ID from JWT token - use ClaimTypes.NameIdentifier for consistency
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                Console.WriteLine($" Message send attempt - UserIdClaim: {userIdClaim?.Value}");
                
                if (userIdClaim == null)
                {
                    Console.WriteLine(" User ID not found in token");
                    return Unauthorized("User ID not found in token");
                }
                int senderId = int.Parse(userIdClaim.Value);
                Console.WriteLine($"Sending message from UserId:{senderId} to UserId:{dto.ReceiverId}");

                var message = _mapper.Map<Message>(dto);
                message.SenderId = senderId; // Override with authenticated user's ID
                message.SentAt = DateTime.UtcNow;
                message.IsRead = false;

                await _repository.CreateMessage(message);
                await _repository.SaveChangesAsync();
                
                Console.WriteLine($" Message saved with ID: {message.MessageId}");

                var messageDto = _mapper.Map<MessageDto>(message);

                // Create notification for receiver about new message
                try
                {
                    var sender = await _userRepository.GetUserById(senderId);
                    var senderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Someone";
                    
                    Console.WriteLine($"Creating notification for user {message.ReceiverId}");
                    await _notificationService.CreateNotification(
                        message.ReceiverId,
                        "New Message",
                        $"{senderName} sent you a message: {(message.Content.Length > 50 ? message.Content.Substring(0, 50) + "..." : message.Content)}",
                        message.MessageId,
                        "Message"
                    );
                    Console.WriteLine($"Notification created");
                }
                catch (Exception notifEx)
                {
                    // Log but don't fail the message send if notification fails
                    Console.WriteLine($" Failed to create notification: {notifEx.Message}");
                }

                return CreatedAtAction(nameof(GetMessageById), new { id = message.MessageId }, messageDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Error sending message: {ex.Message}");
                Console.WriteLine($" Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error sending message", error = ex.Message });
            }
        }
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMessage(int id, MessageDto dto)
        {
            var message = await _repository.GetMessageById(id);
            if (message == null)
            {
                return NotFound();
            }

            _mapper.Map(dto, message);
            await _repository.UpdateMessage(message);
            await _repository.SaveChangesAsync();

            return NoContent();
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _repository.GetMessageById(id);
            if (message == null)
            {
                return NotFound();
            }

            await _repository.DeleteMessage(message);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        // Get all conversations for current user
        [Authorize]
        [HttpGet("conversations")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserConversations()
        {
            var userId = GetCurrentUserId();
            Console.WriteLine($" GetUserConversations called for userId: {userId}");
            
            var conversations = await _repository.GetUserConversations(userId);
            var conversationsList = conversations.ToList();
            
            Console.WriteLine($"Found {conversationsList.Count} conversations for user {userId}");
            foreach (var conv in conversationsList)
            {
                Console.WriteLine($"   Conversation: {System.Text.Json.JsonSerializer.Serialize(conv)}");
            }
            
            return Ok(conversations);
        }

        // Get conversation between current user and another user
        [Authorize]
        [HttpGet("conversation/{otherUserId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetConversation(int otherUserId)
        {
            var userId = GetCurrentUserId();
            var messages = await _repository.GetConversation(userId, otherUserId);
            return Ok(_mapper.Map<IEnumerable<MessageDto>>(messages));
        }

        // Get unread message count
        [Authorize]
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _repository.GetUnreadMessagesCount(userId);
            return Ok(new { count });
        }

        // Mark message as read
        [Authorize]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var message = await _repository.GetMessageById(id);
            if (message == null)
            {
                return NotFound();
            }

            // Verify the message belongs to the current user
            var userId = GetCurrentUserId();
            if (message.ReceiverId != userId)
            {
                return Forbid();
            }

            await _repository.MarkMessageAsRead(id);
            return Ok(new { message = "Message marked as read" });
        }

        // Mark all messages in conversation as read
        [Authorize]
        [HttpPut("conversation/{otherUserId}/read")]
        public async Task<IActionResult> MarkConversationAsRead(int otherUserId)
        {
            var userId = GetCurrentUserId();
            await _repository.MarkConversationAsRead(userId, otherUserId);
            return Ok(new { message = "Conversation marked as read" });
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"GetCurrentUserId - NameIdentifier claim: {userIdClaim}");
            
            // Debug: print all claims
            Console.WriteLine($" All claims for current user:");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"   {claim.Type}: {claim.Value}");
            }
            
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
