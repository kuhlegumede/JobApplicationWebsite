import React from 'react';

const UserTable = ({ users, onDeactivate, onReactivate, onViewDetails }) => {
    const getRoleBadge = (role) => {
        const badgeMap = {
            'Admin': 'bg-danger',
            'Employer': 'bg-primary',
            'JobSeeker': 'bg-success'
        };
        return <span className={`badge ${badgeMap[role] || 'bg-secondary'}`}>{role}</span>;
    };

    const getStatusBadge = (isActive) => {
        return isActive ? 
            <span className="badge bg-success">Active</span> : 
            <span className="badge bg-secondary">Inactive</span>;
    };

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th>User ID</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center text-muted py-4">
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.userId}>
                                <td><code>{user.userId}</code></td>
                                <td>{user.email}</td>
                                <td>{getRoleBadge(user.userRole)}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>{getStatusBadge(user.isActive)}</td>
                                <td>
                                    <div className="btn-group btn-group-sm" role="group">
                                        {onViewDetails && (
                                            <button 
                                                onClick={() => onViewDetails(user)}
                                                className="btn btn-outline-primary"
                                                title="View Details"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        )}
                                        {user.isActive && onDeactivate && (
                                            <button 
                                                onClick={() => onDeactivate(user.userId)}
                                                className="btn btn-outline-danger"
                                                title="Deactivate"
                                            >
                                                <i className="bi bi-x-circle"></i>
                                            </button>
                                        )}
                                        {!user.isActive && onReactivate && (
                                            <button 
                                                onClick={() => onReactivate(user.userId)}
                                                className="btn btn-outline-success"
                                                title="Reactivate"
                                            >
                                                <i className="bi bi-check-circle"></i>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
