using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Job_Application.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ILogger<ChatHub> logger)
        {
            _logger = logger;
        }

        // Called when a client connects
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                _logger.LogInformation("User {UserId} connected to ChatHub with connection {ConnectionId} and added to group {GroupId}", 
                    userId, Context.ConnectionId, userId);
                Console.WriteLine($"SignalR: User {userId} joined group {userId} with connection {Context.ConnectionId}");
            }
            else
            {
                _logger.LogWarning("User connected without valid NameIdentifier claim. ConnectionId: {ConnectionId}", 
                    Context.ConnectionId);
                Console.WriteLine($"SignalR: User connected without valid userId claim. ConnectionId: {Context.ConnectionId}");
            }
            await base.OnConnectedAsync();
        }

        // Called when a client disconnects
        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
                _logger.LogInformation(" User {UserId} disconnected from ChatHub. ConnectionId: {ConnectionId}", 
                    userId, Context.ConnectionId);
                Console.WriteLine($" SignalR: User {userId} disconnected. ConnectionId: {Context.ConnectionId}");
            }
            else
            {
                Console.WriteLine($"SignalR: Connection {Context.ConnectionId} disconnected");
            }
            
            if (exception != null)
            {
                _logger.LogError(exception, " SignalR disconnection error for connection {ConnectionId}", Context.ConnectionId);
                Console.WriteLine($"SignalR disconnection error: {exception.Message}");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        // Send a private message to a specific user
        public async Task SendMessageToUser(string receiverId, string message)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrWhiteSpace(message))
                return;

            await Clients.Group(receiverId).SendAsync("ReceiveMessage", new
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message,
                SentAt = System.DateTime.UtcNow
            });

            await Clients.Caller.SendAsync("MessageSent", new
            {
                ReceiverId = receiverId,
                Message = message,
                SentAt = System.DateTime.UtcNow
            });
        }
    }
}
