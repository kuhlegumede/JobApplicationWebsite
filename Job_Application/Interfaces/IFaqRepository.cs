using Job_Application.Models;

namespace Job_Application.Interfaces
{
    public interface IFaqRepository
    {
        Task<IEnumerable<FAQ>> GetAllFaqs();
        Task<IEnumerable<FAQ>> GetPublishedFaqs();
        Task<IEnumerable<FAQ>> GetFaqsByCategory(FaqCategory category);
        Task<FAQ> GetFaqById(int id);
        Task CreateFaq(FAQ faq);
        Task UpdateFaq(FAQ faq);
        Task DeleteFaq(FAQ faq);
        Task SaveChangesAsync();
    }
}
