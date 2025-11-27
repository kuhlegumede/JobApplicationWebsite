using Job_Application.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
namespace Job_Application.Interfaces
{
    public interface IAdminRepository
    {
        Task<IEnumerable<Admin>> GetAllAdmins();
        Task<Admin> GetAdminById(int id);
        Task CreateAdmin(Admin admin);
        Task UpdateAdmin(Admin admin);
        Task DeleteAdmin(Admin admin);
        Task SaveChangesAsync();
    }
}
