using Job_Application.Data;
using Job_Application.Interfaces;
using Job_Application.Models;
using Microsoft.EntityFrameworkCore;

namespace Job_Application.Repositories
{
    public class FaqRepository : IFaqRepository
    {
        private readonly JobApplicationDbContext _context;

        public FaqRepository(JobApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FAQ>> GetAllFaqs()
        {
            return await _context.FAQs
                .Include(f => f.CreatedBy)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<FAQ>> GetPublishedFaqs()
        {
            return await _context.FAQs
                .Where(f => f.IsPublished)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<FAQ>> GetFaqsByCategory(FaqCategory category)
        {
            return await _context.FAQs
                .Where(f => f.Category == category && f.IsPublished)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();
        }

        public async Task<FAQ> GetFaqById(int id)
        {
            return await _context.FAQs
                .Include(f => f.CreatedBy)
                .FirstOrDefaultAsync(f => f.FaqId == id);
        }

        public async Task CreateFaq(FAQ faq)
        {
            await _context.FAQs.AddAsync(faq);
        }

        public async Task UpdateFaq(FAQ faq)
        {
            faq.UpdatedAt = DateTime.UtcNow;
            _context.FAQs.Update(faq);
            await Task.CompletedTask;
        }

        public async Task DeleteFaq(FAQ faq)
        {
            _context.FAQs.Remove(faq);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
