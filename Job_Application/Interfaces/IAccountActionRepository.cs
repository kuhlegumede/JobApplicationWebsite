using Job_Application.Models;

namespace Job_Application.Interfaces
{
    public interface IAccountActionRepository
    {
        Task<IEnumerable<AccountAction>> GetAllActions();
        Task<IEnumerable<AccountAction>> GetActionsByUserId(int userId);
        Task<IEnumerable<AccountAction>> GetActionsByAdminId(int adminId);
        Task<AccountAction> GetActionById(int actionId);
        Task CreateAction(AccountAction action);
        Task SaveChangesAsync();
    }
}
