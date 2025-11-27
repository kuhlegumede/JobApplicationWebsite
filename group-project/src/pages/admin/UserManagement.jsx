import { AdminHeader } from "../../components/AdminHeader";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import UserTable from "../../components/admin/UserTable";
import DeactivateModal from "../../components/admin/DeactivateModal";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log("UserManagement mounted");
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await adminService.getAllUsers();
      console.log('Users loaded:', response);
      setUsers(response || []);
      setError("");
    } catch (err) {
      setError("Failed to load users");
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = (userId) => {
    const user = users.find(u => u.userId === userId);
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async (reason) => {
    if (!selectedUser) return;
    try {
      await adminService.deactivateUser(selectedUser.userId, reason);
      alert('User deactivated successfully');
      loadUsers();
    } catch (err) {
      setError("Failed to deactivate user");
      console.error(err);
      throw err;
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await adminService.reactivateUser(userId);
      alert('User reactivated successfully');
      loadUsers();
    } catch (err) {
      setError("Failed to reactivate user");
      console.error(err);
    }
  };

  const handleViewDetails = (user) => {
    console.log('View user details:', user);
    // TODO: Navigate to user details page or open details modal
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <>
      <div className="background">
        <AdminHeader />
        <div className="container my-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row justify-content-center">
              <div
                id="card-container"
                className="card shadow p-4 card-container"
                style={{ maxWidth: 1200 }}
              >
                <h2 className="mb-4">User Management</h2>

                <div className="card mb-4">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <ul className="nav nav-pills">
                          {['All', 'Admin', 'Employer', 'JobSeeker'].map(role => (
                            <li className="nav-item" key={role}>
                              <button
                                className={`nav-link ${filterRole === role ? 'active' : ''}`}
                                onClick={() => setFilterRole(role)}
                              >
                                {role} <span className="badge bg-secondary ms-1">
                                  {role === 'All' ? users.length : users.filter(u => u.role === role).length}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <div className="input-group">
                          <span className="input-group-text"><i className="bi bi-search"></i></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <UserTable
                  users={filteredUsers}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          )}
        </div>
        <Footer />

        {showDeactivateModal && selectedUser && (
          <DeactivateModal
            isOpen={showDeactivateModal}
            onClose={() => setShowDeactivateModal(false)}
            user={selectedUser}
            onConfirm={handleConfirmDeactivate}
          />
        )}
      </div>
    </>
  );
}
