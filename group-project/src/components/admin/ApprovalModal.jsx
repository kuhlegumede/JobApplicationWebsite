import React, { useState } from 'react';

const ApprovalModal = ({ isOpen, onClose, employer, onConfirm, type }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (type === 'reject' && !reason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setLoading(true);
        try {
            await onConfirm(reason);
            setReason('');
            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {type === 'approve' ? '✓ Approve Employer' : '✗ Reject Employer'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="mb-3">
                            <h6>{employer?.companyName}</h6>
                            <p className="text-muted mb-0">{employer?.employerEmail}</p>
                        </div>

                        {type === 'approve' ? (
                            <div className="alert alert-info">
                                Are you sure you want to approve <strong>{employer?.companyName}</strong>? 
                                They will be able to create job posts immediately after approval.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} id="approvalForm">
                                <div className="mb-3">
                                    <label htmlFor="reason" className="form-label">
                                        Reason for Rejection <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="reason"
                                        className="form-control"
                                        rows="4"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Please provide a clear reason for rejecting this employer..."
                                        required
                                    />
                                    <small className="form-text text-muted">
                                        This reason will be sent to the employer via notification.
                                    </small>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type={type === 'reject' ? 'submit' : 'button'}
                            form={type === 'reject' ? 'approvalForm' : undefined}
                            className={`btn ${type === 'approve' ? 'btn-success' : 'btn-danger'}`}
                            onClick={type === 'approve' ? handleSubmit : undefined}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (type === 'approve' ? 'Approve' : 'Reject')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalModal;
