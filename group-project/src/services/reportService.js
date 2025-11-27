import api from './authUtils';

const reportService = {
    // Analytics endpoints
    getApplicationTrends: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/admin/analytics/application-trends?${params.toString()}`);
    },
    
    getUserGrowth: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/admin/analytics/user-growth?${params.toString()}`);
    },
    
    getJobPostAnalytics: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/admin/analytics/job-posts?${params.toString()}`);
    },
    
    getEmployerAnalytics: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/admin/analytics/employers?${params.toString()}`);
    },
    
    getSystemOverview: (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/admin/analytics/system-overview?${params.toString()}`);
    },
};

export default reportService;
