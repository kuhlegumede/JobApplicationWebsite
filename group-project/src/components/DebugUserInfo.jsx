import { useState } from "react";

export function DebugUserInfo() {
  const [show, setShow] = useState(false);
  
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="btn btn-sm btn-outline-secondary"
        style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999 }}
      >
        Debug Info
      </button>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  return (
    <div
      className="card shadow-lg"
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '500px',
        overflow: 'auto',
        zIndex: 9999,
      }}
    >
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Debug: User Info</h6>
        <button
          onClick={() => setShow(false)}
          className="btn btn-sm btn-close"
        />
      </div>
      <div className="card-body" style={{ fontSize: '12px' }}>
        <div className="mb-2">
          <strong>Has Token:</strong> {token ? '✅ Yes' : '❌ No'}
        </div>
        <div className="mb-2">
          <strong>User ID:</strong> {user.userId || 'Not found'}
        </div>
        <div className="mb-2">
          <strong>Email:</strong> {user.email || 'Not found'}
        </div>
        <div className="mb-2">
          <strong>Role:</strong> {user.userRole || 'Not found'}
        </div>
        <div className="mb-2">
          <strong>Employer ID:</strong> {user.employer?.employerId || user.employerId || 'Not found'}
        </div>
        <hr />
        <details>
          <summary style={{ cursor: 'pointer' }}>Full User Object</summary>
          <pre className="mt-2" style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
