using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IMessageRepository
    {
        Task<IEnumerable<Message>> GetAllMessages();
        Task<Message>GetMessageById(int id);
        Task CreateMessage(Message message);
        Task UpdateMessage(Message message);
        Task DeleteMessage(Message message);
        Task SaveChangesAsync();
        
        // Conversation methods
        Task<IEnumerable<Message>> GetConversation(int userId1, int userId2);
        Task<IEnumerable<object>> GetUserConversations(int userId);
        Task<int> GetUnreadMessagesCount(int userId);
        Task MarkMessageAsRead(int messageId);
        Task MarkConversationAsRead(int currentUserId, int otherUserId);
    }
}
