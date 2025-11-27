import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { AdminHeader } from '../../components/AdminHeader';
import { Footer } from '../../components/Footer';

const JobPostModeration = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('flagged');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');

    const loadJobPosts = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (filter === 'flagged') response = await adminService.getFlaggedJobPosts();
            else if (filter === 'removed') response = await adminService.getRemovedJobPosts();
            else response = await adminService.getAllJobPosts();
            setJobPosts(response || []);
        } catch (error) {
            console.error('Error loading job posts:', error);
            alert('Failed to load job posts');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadJobPosts();
    }, [loadJobPosts]);

    const handleAction = (post, action) => {
        setSelectedPost(post);
        setModalAction(action);
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedPost) return;
        try {
            if (modalAction === 'remove') await adminService.removeJobPost(selectedPost.jobPostId);
            else if (modalAction === 'restore') await adminService.restoreJobPost(selectedPost.jobPostId);
            else if (modalAction === 'flag') await adminService.flagJobPost(selectedPost.jobPostId);
            
            alert(`Job post ${modalAction}ed successfully`);
            setShowModal(false);
            setSelectedPost(null);
            loadJobPosts();
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action');
        }
    };

    const filteredPosts = jobPosts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (post) => {
        if (post.isRemoved) return <span className="badge bg-danger">Removed</span>;
        if (post.isFlagged) return <span className="badge bg-warning text-dark">Flagged</span>;
        if (post.status === 'Closed') return <span className="badge bg-secondary">Closed</span>;
        return <span className="badge bg-success">Active</span>;
    };

    return (
        <>
            <div className="background">
                <AdminHeader />
                <div className="container py-4">
                    <div id="card-container" className="card shadow p-4 card-container">
                        <div className="mb-4">
                            <h1 className="display-5 fw-bold">🔍 Job Post Moderation</h1>
                            <p className="text-muted">Monitor and moderate job postings</p>
                        </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <ul className="nav nav-pills mb-3">
                        <li className="nav-item"><button className={`nav-link ${filter === 'flagged' ? 'active' : ''}`} 
                            onClick={() => setFilter('flagged')}>Flagged Posts</button></li>
                        <li className="nav-item"><button className={`nav-link ${filter === 'all' ? 'active' : ''}`} 
                            onClick={() => setFilter('all')}>All Posts</button></li>
                        <li className="nav-item"><button className={`nav-link ${filter === 'removed' ? 'active' : ''}`} 
                            onClick={() => setFilter('removed')}>Removed Posts</button></li>
                    </ul>
                    
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input type="text" className="form-control" placeholder="Search by title, company, or location..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="alert alert-info">No job posts found</div>
            ) : (
                <div className="row g-3">
                    {filteredPosts.map(post => (
                        <div key={post.jobPostId} className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h5 className="card-title mb-1">{post.title}</h5>
                                            <p className="text-muted mb-0">{post.companyName}</p>
                                        </div>
                                        {getStatusBadge(post)}
                                    </div>

                                    <div className="row g-2 small mb-3">
                                        <div className="col-md-4"><strong>Location:</strong> {post.location}</div>
                                        <div className="col-md-4"><strong>Salary:</strong> {post.salaryRange || 'Not specified'}</div>
                                        <div className="col-md-4"><strong>Posted:</strong> {new Date(post.postedDate).toLocaleDateString()}</div>
                                    </div>

                                    {post.description && (
                                        <p className="text-muted mb-3">{post.description.substring(0, 200)}...</p>
                                    )}

                                    {post.flagReason && (
                                        <div className="alert alert-warning py-2 mb-3">
                                            <strong>Flag Reason:</strong> {post.flagReason}
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 justify-content-end">
                                        {!post.isRemoved && !post.isFlagged && (
                                            <button onClick={() => handleAction(post, 'flag')} className="btn btn-warning btn-sm">
                                                Flag Post
                                            </button>
                                        )}
                                        {!post.isRemoved && (
                                            <button onClick={() => handleAction(post, 'remove')} className="btn btn-danger btn-sm">
                                                Remove Post
                                            </button>
                                        )}
                                        {post.isRemoved && (
                                            <button onClick={() => handleAction(post, 'restore')} className="btn btn-success btn-sm">
                                                Restore Post
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowModal(false)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Action</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to {modalAction} the job post:
                                    <strong> "{selectedPost?.title}"</strong>?</p>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button onClick={confirmAction} className="btn btn-primary">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default JobPostModeration;
