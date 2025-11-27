import React from 'react';

const JobPostCard = ({ jobPost, onFlag, onRemove, onRestore, onView }) => {
    const getStatusBadge = () => {
        if (jobPost.isRemoved) return <span className="badge bg-danger">Removed</span>;
        if (jobPost.isFlagged) return <span className="badge bg-warning text-dark">Flagged</span>;
        if (jobPost.status === 'Closed') return <span className="badge bg-secondary">Closed</span>;
        return <span className="badge bg-success">Active</span>;
    };

    return (
        <div className="card shadow-sm mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <h5 className="card-title mb-1">{jobPost.title}</h5>
                        <p className="text-muted mb-0">
                            <i className="bi bi-building me-2"></i>{jobPost.companyName}
                        </p>
                    </div>
                    {getStatusBadge()}
                </div>

                <div className="row g-2 small mb-3">
                    <div className="col-md-3">
                        <strong>Location:</strong> {jobPost.location}
                    </div>
                    <div className="col-md-3">
                        <strong>Job Type:</strong> {jobPost.jobType}
                    </div>
                    <div className="col-md-3">
                        <strong>Salary:</strong> {jobPost.salaryRange || 'Not specified'}
                    </div>
                    <div className="col-md-3">
                        <strong>Posted:</strong> {new Date(jobPost.postedDate).toLocaleDateString()}
                    </div>
                </div>

                {jobPost.description && (
                    <div className="mb-3">
                        <p className="text-muted mb-0">
                            {jobPost.description.substring(0, 150)}
                            {jobPost.description.length > 150 ? '...' : ''}
                        </p>
                    </div>
                )}

                {jobPost.flagReason && (
                    <div className="alert alert-warning py-2 mb-3">
                        <strong>Flag Reason:</strong> {jobPost.flagReason}
                    </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                    {onView && (
                        <button onClick={() => onView(jobPost)} className="btn btn-outline-primary btn-sm">
                            View Details
                        </button>
                    )}
                    {!jobPost.isRemoved && !jobPost.isFlagged && onFlag && (
                        <button onClick={() => onFlag(jobPost.jobPostId)} className="btn btn-warning btn-sm">
                            Flag
                        </button>
                    )}
                    {!jobPost.isRemoved && onRemove && (
                        <button onClick={() => onRemove(jobPost.jobPostId)} className="btn btn-danger btn-sm">
                            Remove
                        </button>
                    )}
                    {jobPost.isRemoved && onRestore && (
                        <button onClick={() => onRestore(jobPost.jobPostId)} className="btn btn-success btn-sm">
                            Restore
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobPostCard;
