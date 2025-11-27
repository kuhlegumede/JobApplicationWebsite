import React, { useState, useEffect } from "react";

export function NewMessageModal({ show, onHide, onSelectUser, userType }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Load employers for job seekers, job seekers for employers
      const endpoint = userType === "jobSeeker" 
        ? "https://localhost:7087/api/Employer"
        : "https://localhost:7087/api/JobSeeker";

      console.log("Loading users from:", endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded users:", data);
        setUsers(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to load users:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const filteredUsers = users.filter((user) => {
    const name = userType === "jobSeeker" 
      ? user.companyName 
      : `${user.user?.firstName || ''} ${user.user?.lastName || ''}`.trim();
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectUser = (user) => {
    // Use the actual userId from the User object, not the role-specific ID
    const userId = user.userId;
    const userName = userType === "jobSeeker" 
      ? user.companyName 
      : `${user.user?.firstName || ''} ${user.user?.lastName || ''}`.trim();
    
    console.log("Selected user:", { userId, userName, user });
    
    onSelectUser(userId, userName);
    setSearchTerm("");
    onHide();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onHide}
        style={{ zIndex: 1050 }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Message</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search ${userType === "jobSeeker" ? "employers" : "job seekers"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="list-group" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-inbox" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      // Use the actual userId from the User object, not the role-specific ID
                      const userId = user.userId;
                      const userName = userType === "jobSeeker" 
                        ? user.companyName 
                        : `${user.user?.firstName || ''} ${user.user?.lastName || ''}`.trim();
                      const displayName = userName || 'Unknown User';
                      
                      return (
                        <button
                          key={userId}
                          type="button"
                          className="list-group-item list-group-item-action d-flex align-items-center"
                          onClick={() => handleSelectUser(user)}
                        >
                          <i className="bi bi-person-circle me-3" style={{ fontSize: "2rem" }}></i>
                          <div className="text-start">
                            <strong>{displayName}</strong>
                            {userType === "jobSeeker" && user.industry && (
                              <div className="text-muted small">{user.industry}</div>
                            )}
                            {userType === "employer" && user.user?.email && (
                              <div className="text-muted small">{user.user.email}</div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
