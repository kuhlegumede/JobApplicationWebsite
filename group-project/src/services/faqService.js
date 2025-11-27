import api from './authUtils';

const faqService = {
    // Public endpoints
    getPublishedFaqs: () => api.get('/faq/published'),
    getFaqsByCategory: (category) => api.get(`/faq/published/category/${category}`),
    getFaqById: (id) => api.get(`/faq/${id}`),
    
    // Admin endpoints
    getAllFaqs: () => api.get('/faq'),
    createFaq: (data) => api.post('/faq', data),
    updateFaq: (id, data) => api.put(`/faq/${id}`, data),
    deleteFaq: (id) => api.delete(`/faq/${id}`),
    publishFaq: (id) => api.post(`/faq/${id}/publish`),
    unpublishFaq: (id) => api.post(`/faq/${id}/unpublish`),
    reorderFaqs: (orderedIds) => api.post('/faq/reorder', { orderedIds }),
};

export default faqService;
