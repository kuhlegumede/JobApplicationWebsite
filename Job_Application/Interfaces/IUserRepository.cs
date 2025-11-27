using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUsers();
        Task<User>GetUserById(int id);
        Task CreateUser(User user, string password);
        Task UpdateUser(User user);
        Task DeleteUser(User user);
        Task SaveChangesAsync();

        // Account Management Methods
        Task<IEnumerable<User>> GetActiveUsers();
        Task<IEnumerable<User>> GetDeactivatedUsers();
        Task<User> GetUserByEmail(string email);
    }
}
