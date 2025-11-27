import React, { useState, useEffect, useCallback } from 'react';
import reportService from '../../services/reportService';
import { AdminHeader } from '../../components/AdminHeader';
import { Footer } from '../../components/Footer';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = dateRange;
            let response;
            
            switch (activeTab) {
                case 'overview':
                    response = await reportService.getSystemOverview(startDate, endDate);
                    break;
                case 'applications':
                    response = await reportService.getApplicationTrends(startDate, endDate);
                    break;
                case 'users':
                    response = await reportService.getUserGrowth(startDate, endDate);
                    break;
                case 'jobPosts':
                    response = await reportService.getJobPostAnalytics(startDate, endDate);
                    break;
                case 'employers':
                    response = await reportService.getEmployerAnalytics(startDate, endDate);
                    break;
                default:
                    break;
            }
            setData(response || null);
        } catch (error) {
            console.error('Error loading report data:', error);
            console.error('Error details:', error.response || error.message);
            alert('Failed to load report data: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [activeTab, dateRange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const MetricCard = ({ title, value, subtitle, bgClass = 'primary' }) => (
        <div className="col-md-6 col-lg-4">
            <div className={`card text-white bg-${bgClass} shadow-sm`}>
                <div className="card-body">
                    <h6 className="card-subtitle text-white-50 text-uppercase small mb-2">{title}</h6>
                    <h2 className="card-title mb-0 fw-bold">{value}</h2>
                    {subtitle && <p className="mb-0 mt-2 small text-white-50">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="background">
                <AdminHeader />
                <div className="container py-4">
                    <div id="card-container" className="card shadow p-4 card-container">
                        <div className="mb-4">
                            <h1 className="display-5 fw-bold">📊 Analytics & Reports</h1>
                            <p className="text-muted">Comprehensive platform analytics and insights</p>
                        </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-5">
                            <label className="form-label">Start Date</label>
                            <input type="date" className="form-control" name="startDate" 
                                value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label">End Date</label>
                            <input type="date" className="form-control" name="endDate" 
                                value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <button onClick={() => setDateRange({startDate: '', endDate: ''})} className="btn btn-secondary w-100">
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ul className="nav nav-tabs mb-4">
                {[
                    {id: 'overview', label: 'System Overview'},
                    {id: 'applications', label: 'Applications'},
                    {id: 'users', label: 'User Growth'},
                    {id: 'jobPosts', label: 'Job Posts'},
                    {id: 'employers', label: 'Employers'}
                ].map(tab => (
                    <li className="nav-item" key={tab.id}>
                        <button className={`nav-link ${activeTab === tab.id ? 'active' : ''}`} 
                            onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    </li>
                ))}
            </ul>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : data ? (
                <div className="row g-4">
                    {activeTab === 'overview' && (
                        <>
                            <MetricCard title="Total Users" value={data.totalUsers} subtitle={`${data.activeUsers} active`} bgClass="primary" />
                            <MetricCard title="Job Seekers" value={data.totalJobSeekers} bgClass="success" />
                            <MetricCard title="Employers" value={data.totalEmployers} subtitle={`${data.approvedEmployers} approved`} bgClass="info" />
                            <MetricCard title="Job Posts" value={data.totalJobPosts} subtitle={`${data.activeJobPosts} active`} bgClass="warning" />
                            <MetricCard title="Applications" value={data.totalApplications} subtitle={`${data.pendingApplications} pending`} bgClass="primary" />
                            <MetricCard title="Flagged Posts" value={data.flaggedJobPosts} bgClass="danger" />
                            <MetricCard title="Removed Posts" value={data.removedJobPosts} bgClass="secondary" />
                            <MetricCard title="Deactivated Users" value={data.deactivatedUsers} bgClass="dark" />
                        </>
                    )}
                    {activeTab === 'applications' && (
                        <>
                            <MetricCard title="Total Applications" value={data.totalApplications} bgClass="primary" />
                            <MetricCard title="Pending" value={data.pendingApplications} bgClass="warning" />
                            <MetricCard title="Under Review" value={data.reviewedApplications} bgClass="info" />
                            <MetricCard title="Hired" value={data.acceptedApplications} bgClass="success" />
                            <MetricCard title="Rejected" value={data.rejectedApplications} bgClass="danger" />
                            <MetricCard title="Avg per Job" value={data.averageApplicationsPerJob?.toFixed(2)} bgClass="secondary" />
                        </>
                    )}
                    {activeTab === 'users' && (
                        <>
                            <MetricCard title="Total Users" value={data.totalUsers} bgClass="primary" />
                            <MetricCard title="Active Users" value={data.activeUsers} bgClass="success" />
                            <MetricCard title="Job Seekers" value={data.totalJobSeekers} bgClass="info" />
                            <MetricCard title="Employers" value={data.totalEmployers} bgClass="warning" />
                            <MetricCard title="Admins" value={data.totalAdmins} bgClass="danger" />
                            <MetricCard title="New This Month" value={data.newUsersThisMonth} bgClass="primary" />
                            <MetricCard title="Growth Rate" value={`${data.growthRate}%`} bgClass="success" />
                        </>
                    )}
                    {activeTab === 'jobPosts' && (
                        <>
                            <MetricCard title="Total Job Posts" value={data.totalJobPosts} bgClass="primary" />
                            <MetricCard title="Active" value={data.activeJobPosts} bgClass="success" />
                            <MetricCard title="Closed" value={data.closedJobPosts} bgClass="secondary" />
                            <MetricCard title="Removed" value={data.removedJobPosts} bgClass="danger" />
                            <MetricCard title="Flagged" value={data.flaggedJobPosts} bgClass="warning" />
                            <MetricCard title="Avg Duration (days)" value={data.averageJobDuration?.toFixed(0)} bgClass="info" />
                        </>
                    )}
                    {activeTab === 'employers' && (
                        <>
                            <MetricCard title="Total Employers" value={data.totalEmployers} bgClass="primary" />
                            <MetricCard title="Approved" value={data.approvedEmployers} bgClass="success" />
                            <MetricCard title="Pending" value={data.pendingEmployers} bgClass="warning" />
                            <MetricCard title="Rejected" value={data.rejectedEmployers} bgClass="danger" />
                            <MetricCard title="Approval Rate" value={`${data.approvalRate}%`} bgClass="info" />
                            <MetricCard title="New This Month" value={data.newEmployersThisMonth} bgClass="primary" />
                            <MetricCard title="Approved This Month" value={data.employersApprovedThisMonth} bgClass="success" />
                            <MetricCard title="Avg Approval Time (hrs)" value={data.averageApprovalTime?.toFixed(1)} bgClass="secondary" />
                        </>
                    )}
                </div>
            ) : (
                <div className="alert alert-info">No data available for the selected criteria</div>
            )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Reports;
