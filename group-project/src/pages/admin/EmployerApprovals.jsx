import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import EmployerCard from '../../components/admin/EmployerCard';
import ApprovalModal from '../../components/admin/ApprovalModal';
import { AdminHeader } from '../../components/AdminHeader';
import { Footer } from '../../components/Footer';

const EmployerApprovals = () => {
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [modalType, setModalType] = useState('approve');

    const fetchEmployers = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (filter === 'Pending') {
                response = await adminService.getPendingEmployers();
            } else if (filter === 'Approved') {
                response = await adminService.getEmployersByStatus('Approved');
            } else if (filter === 'Rejected') {
                response = await adminService.getEmployersByStatus('Rejected');
            } else {
                // For 'All', fetch all statuses and combine
                const [pending, approved, rejected] = await Promise.all([
                    adminService.getPendingEmployers(),
                    adminService.getEmployersByStatus('Approved'),
                    adminService.getEmployersByStatus('Rejected')
                ]);
                response = [...pending, ...approved, ...rejected];
            }
            setEmployers(response || []);
        } catch (error) {
            console.error('Error fetching employers:', error);
            alert('Failed to load employers');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchEmployers();
    }, [fetchEmployers]);

    useEffect(() => {
        const filtered = employers.filter(emp => {
            const matchesFilter = filter === 'All' || emp.approvalStatus === filter;
            const matchesSearch = emp.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                emp.employerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                emp.location?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
        setFilteredEmployers(filtered);
    }, [employers, filter, searchTerm]);

    const handleApprove = (employerId) => {
        const employer = employers.find(e => e.employerId === employerId);
        setSelectedEmployer(employer);
        setModalType('approve');
        setModalOpen(true);
    };

    const handleReject = (employerId) => {
        const employer = employers.find(e => e.employerId === employerId);
        setSelectedEmployer(employer);
        setModalType('reject');
        setModalOpen(true);
    };

    const handleConfirmApproval = async (reason) => {
        if (!selectedEmployer) return;
        
        try {
            if (modalType === 'approve') {
                await adminService.approveEmployer(selectedEmployer.employerId);
                alert('Employer approved successfully');
            } else {
                await adminService.rejectEmployer(selectedEmployer.employerId, reason);
                alert('Employer rejected successfully');
            }
            setModalOpen(false);
            setSelectedEmployer(null);
            fetchEmployers();
        } catch (error) {
            console.error('Error processing employer:', error);
            alert('Failed to process employer');
        }
    };

    const counts = {
        All: employers.length,
        Pending: employers.filter(e => e.approvalStatus === 'Pending').length,
        Approved: employers.filter(e => e.approvalStatus === 'Approved').length,
        Rejected: employers.filter(e => e.approvalStatus === 'Rejected').length
    };

    return (
        <>
            <div className="background">
                <AdminHeader />
                <div className="container py-4">
                    <div id="card-container" className="card shadow p-4 card-container">
                        <div className="mb-4">
                            <h1 className="display-5 fw-bold">Employer Approvals</h1>
                            <p className="text-muted">Review and approve employer registrations</p>
                        </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <ul className="nav nav-pills mb-3">
                        {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                            <li className="nav-item" key={status}>
                                <button 
                                    className={`nav-link ${filter === status ? 'active' : ''}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status} <span className="badge bg-secondary ms-2">{counts[status]}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by company name, email, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredEmployers.length === 0 ? (
                <div className="alert alert-info">No employers found matching your criteria</div>
            ) : (
                <div>
                    {filteredEmployers.map(employer => (
                        <EmployerCard
                            key={employer.employerId}
                            employer={employer}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onViewDetails={(emp) => console.log('View details:', emp)}
                        />
                    ))}
                </div>
            )}

            {modalOpen && selectedEmployer && (
                <ApprovalModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    employer={selectedEmployer}
                    onConfirm={handleConfirmApproval}
                    type={modalType}
                />
            )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default EmployerApprovals;
