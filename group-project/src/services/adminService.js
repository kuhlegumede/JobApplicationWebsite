import api from './authUtils';

const adminService = {
    // Dashboard & Stats
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    
    // Employer Approval
    getPendingEmployers: () => api.get('/admin/employers/pending'),
    getEmployersByStatus: (status) => api.get(`/admin/employers/approval-status/${status}`),
    approveEmployer: (employerId) => api.post(`/admin/employers/${employerId}/approve`),
    rejectEmployer: (employerId, reason) => api.post(`/admin/employers/${employerId}/reject`, { employerId, reason }),
    
    // Job Post Moderation
    getFlaggedJobPosts: () => api.get('/admin/job-posts/flagged'),
    getRemovedJobPosts: () => api.get('/admin/job-posts/removed'),
    getAllJobPosts: () => api.get('/JobPost'),
    removeJobPost: (jobPostId, reason) => api.post(`/admin/job-posts/${jobPostId}/remove`, { jobPostId, reason }),
    restoreJobPost: (jobPostId) => api.post(`/admin/job-posts/${jobPostId}/restore`),
    flagJobPost: (jobPostId) => api.post(`/admin/job-posts/${jobPostId}/flag`),
    unflagJobPost: (jobPostId) => api.post(`/admin/job-posts/${jobPostId}/unflag`),
    
    // User Management
    getAllUsers: () => api.get('/admin/users'),
    deactivateUser: (userId, reason) => api.post(`/admin/users/${userId}/deactivate`, { reason }),
    reactivateUser: (userId) => api.post(`/admin/users/${userId}/reactivate`),
    getUserActions: (userId) => api.get(`/admin/users/${userId}/actions`),
    
    // Notifications
    createSystemNotification: (data) => api.post('/admin/notifications/system', data),
    createRoleNotification: (data) => api.post('/admin/notifications/role', data),
    createUserNotification: (data) => api.post('/admin/notifications/user', data),
    getAllNotifications: () => api.get('/admin/notifications'),
    getNotificationsByRole: (role) => api.get(`/admin/notifications/role/${role}`),
};

export default adminService;
