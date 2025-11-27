import React from 'react';

const EmployerCard = ({ employer, onApprove, onReject, onViewDetails }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = () => {
        const status = employer.approvalStatus || 'Pending';
        const badgeClass = {
            'Approved': 'bg-success',
            'Rejected': 'bg-danger',
            'Pending': 'bg-warning text-dark'
        }[status] || 'bg-warning text-dark';
        
        return <span className={`badge ${badgeClass}`}>{status}</span>;
    };

    return (
        <div className="card shadow-sm mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-3 flex-grow-1">
                        <div className="flex-shrink-0">
                            {employer.logoUrl ? (
                                <img src={employer.logoUrl} alt={employer.companyName} 
                                     className="rounded" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                            ) : (
                                <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" 
                                     style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                    {employer.companyName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-grow-1">
                            <h5 className="card-title mb-1">{employer.companyName}</h5>
                            <p className="text-muted mb-0">
                                <i className="bi bi-geo-alt"></i> {employer.location || 'Not specified'}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                <div className="mb-3">
                    <div className="row g-2 small">
                        <div className="col-md-4">
                            <strong>Contact:</strong> {employer.employerEmail || 'N/A'}
                        </div>
                        <div className="col-md-4">
                            <strong>Website:</strong>{' '}
                            {employer.website ? (
                                <a href={employer.website} target="_blank" rel="noopener noreferrer">
                                    {employer.website}
                                </a>
                            ) : 'N/A'}
                        </div>
                        <div className="col-md-4">
                            <strong>Registered:</strong> {formatDate(employer.createdAt)}
                        </div>
                    </div>
                </div>

                {employer.companyDescription && (
                    <div className="mb-3">
                        <p className="text-muted mb-0">
                            {employer.companyDescription.substring(0, 150)}
                            {employer.companyDescription.length > 150 ? '...' : ''}
                        </p>
                    </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                    <button onClick={() => onViewDetails(employer)} className="btn btn-outline-primary btn-sm">
                        View Details
                    </button>
                    {employer.approvalStatus === 'Pending' && (
                        <>
                            <button onClick={() => onApprove(employer.employerId)} className="btn btn-success btn-sm">
                                ✓ Approve
                            </button>
                            <button onClick={() => onReject(employer.employerId)} className="btn btn-danger btn-sm">
                                ✗ Reject
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployerCard;
