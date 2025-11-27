import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import StatsCard from '../../components/admin/StatsCard';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboardStats();
            setStats(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button onClick={fetchDashboardStats} className="btn btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="mb-4">
                <h1 className="display-5 fw-bold">Admin Dashboard</h1>
                <p className="text-muted">Overview of platform statistics and metrics</p>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-lg-4 col-xl-2">
                    <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" color="primary" 
                        trend={stats?.activeUsers > stats?.totalUsers * 0.8 ? 'up' : 'down'}
                        trendValue={`${stats?.activeUsers || 0} active`} />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-2">
                    <StatsCard title="Job Seekers" value={stats?.totalJobSeekers || 0} icon="🔍" color="success" />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-2">
                    <StatsCard title="Employers" value={stats?.totalEmployers || 0} icon="🏢" color="info" 
                        trendValue={`${stats?.pendingEmployers || 0} pending`} />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-2">
                    <StatsCard title="Job Posts" value={stats?.totalJobPosts || 0} icon="💼" color="warning" 
                        trendValue={`${stats?.activeJobPosts || 0} active`} />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-2">
                    <StatsCard title="Applications" value={stats?.totalApplications || 0} icon="📄" color="primary" />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-2">
                    <StatsCard title="Pending Approvals" value={stats?.pendingEmployers || 0} icon="⏳" color="danger" />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <Link to="/admin/employers" className="btn btn-outline-primary w-100 text-start d-flex justify-content-between align-items-center">
                                        <span><i className="bi bi-building me-2"></i>Review Employers</span>
                                        {stats?.pendingEmployers > 0 && <span className="badge bg-danger">{stats.pendingEmployers}</span>}
                                    </Link>
                                </div>
                                <div className="col-md-6">
                                    <Link to="/admin/job-moderation" className="btn btn-outline-warning w-100 text-start d-flex justify-content-between align-items-center">
                                        <span><i className="bi bi-flag me-2"></i>Moderate Job Posts</span>
                                        {stats?.flaggedJobPosts > 0 && <span className="badge bg-warning text-dark">{stats.flaggedJobPosts}</span>}
                                    </Link>
                                </div>
                                <div className="col-md-6">
                                    <Link to="/admin/users" className="btn btn-outline-info w-100 text-start">
                                        <i className="bi bi-people me-2"></i>Manage Users
                                    </Link>
                                </div>
                                <div className="col-md-6">
                                    <Link to="/admin/reports" className="btn btn-outline-success w-100 text-start">
                                        <i className="bi bi-graph-up me-2"></i>View Reports
                                    </Link>
                                </div>
                                <div className="col-md-6">
                                    <Link to="/admin/faqs" className="btn btn-outline-secondary w-100 text-start">
                                        <i className="bi bi-question-circle me-2"></i>Manage FAQs
                                    </Link>
                                </div>
                                <div className="col-md-6">
                                    <Link to="/admin/notifications" className="btn btn-outline-dark w-100 text-start">
                                        <i className="bi bi-bell me-2"></i>Send Notifications
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="card-title mb-0">Recent Activity</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                {stats?.newUsersLast7Days > 0 && (
                                    <li className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex"><span className="me-2">👋</span>
                                            <p className="mb-0 small">{stats.newUsersLast7Days} new users in the last 7 days</p>
                                        </div>
                                    </li>
                                )}
                                {stats?.activeJobPosts > 0 && (
                                    <li className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex"><span className="me-2">💼</span>
                                            <p className="mb-0 small">{stats.activeJobPosts} active job posts</p>
                                        </div>
                                    </li>
                                )}
                                {stats?.removedJobPosts > 0 && (
                                    <li className="mb-0">
                                        <div className="d-flex"><span className="me-2">🚫</span>
                                            <p className="mb-0 small">{stats.removedJobPosts} removed job posts</p>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
