import React, { useState } from 'react';

const DeactivateModal = ({ isOpen, onClose, user, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            alert('Please provide a reason for deactivation');
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
                        <h5 className="modal-title">Deactivate User Account</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <strong>Warning:</strong> This action will deactivate the user's account and restrict their access to the platform.
                        </div>

                        <div className="mb-3">
                            <h6>User Information</h6>
                            <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                            <p className="mb-0"><strong>Role:</strong> {user?.role}</p>
                        </div>

                        <form onSubmit={handleSubmit} id="deactivateForm">
                            <div className="mb-3">
                                <label htmlFor="reason" className="form-label">
                                    Reason for Deactivation <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    className="form-control"
                                    rows="4"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a detailed reason for deactivating this user account..."
                                    required
                                />
                                <small className="form-text text-muted">
                                    This reason will be logged for administrative records.
                                </small>
                            </div>
                        </form>
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
                            type="submit"
                            form="deactivateForm"
                            className="btn btn-danger"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Deactivate User'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeactivateModal;
