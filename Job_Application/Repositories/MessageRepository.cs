using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly JobApplicationDbContext _context;
        public MessageRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Message>>GetAllMessages()
        {
            return await _context.Messages.ToListAsync();
        }

        public async Task<Message>GetMessageById(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(x => x.MessageId == id);
        }

        public async Task CreateMessage(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMessage(Message message)
        {
            _context.Messages.Update(message);
             await _context.SaveChangesAsync();
        }

        public async Task DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Message>> GetConversation(int userId1, int userId2)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                           (m.SenderId == userId2 && m.ReceiverId == userId1))
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetUserConversations(int userId)
        {
            Console.WriteLine($"GetUserConversations repository called for userId: {userId}");
            
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            Console.WriteLine($"Found {messages.Count} messages for user {userId}");
            
            foreach (var msg in messages.Take(5))
            {
                Console.WriteLine($"   Message {msg.MessageId}: SenderId={msg.SenderId}, ReceiverId={msg.ReceiverId}, Content={msg.Content.Substring(0, Math.Min(20, msg.Content.Length))}...");
                Console.WriteLine($"   Sender: {msg.Sender?.FirstName} {msg.Sender?.LastName}, Receiver: {msg.Receiver?.FirstName} {msg.Receiver?.LastName}");
            }

            var conversations = messages
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g => new
                {
                    PartnerId = g.Key,
                    PartnerName = g.First().SenderId == userId 
                        ? $"{g.First().Receiver.FirstName} {g.First().Receiver.LastName}"
                        : $"{g.First().Sender.FirstName} {g.First().Sender.LastName}",
                    LastMessage = g.First().Content,
                    LastMessageTime = g.First().SentAt,
                    UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead)
                })
                .ToList<object>();

            Console.WriteLine($" Grouped into {conversations.Count} conversations");

            return conversations;
        }

        public async Task<int> GetUnreadMessagesCount(int userId)
        {
            return await _context.Messages
                .Where(m => m.ReceiverId == userId && !m.IsRead)
                .CountAsync();
        }

        public async Task MarkMessageAsRead(int messageId)
        {
            var message = await GetMessageById(messageId);
            if (message != null)
            {
                message.IsRead = true;
                _context.Messages.Update(message);
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkConversationAsRead(int currentUserId, int otherUserId)
        {
            var messages = await _context.Messages
                .Where(m => m.SenderId == otherUserId && m.ReceiverId == currentUserId && !m.IsRead)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
