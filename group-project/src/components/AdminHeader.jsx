import { Link } from "react-router-dom";
import { logout } from "../services/authUtils";
import NextStep from "../assets/NextStep.png";
export function AdminHeader() {
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };
  return (
    <header className="d-flex align-items-center justify-content-between px-3 py-2">
      {" "}
      <Link to="/admin/home">
        {" "}
        <img
          className="logo"
          src={NextStep}
          alt="Logo"
          style={{ width: "140px", height: "50px" }}
        />{" "}
      </Link>{" "}
      <div className="d-flex align-items-center justify-content-center gap-3">
        {" "}
        <Link to="/admin/home" className="text-center text-decoration-none">
          <i className="bi bi-speedometer2 fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Dashboard</div>
        </Link>
        <Link to="/admin/employer-approvals" className="text-center text-decoration-none">
          <i className="bi bi-building-check fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Employer Approvals</div>
        </Link>
        <Link to="/admin/job-post-moderation" className="text-center text-decoration-none">
          <i className="bi bi-clipboard-check fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Job Post Moderation</div>
        </Link>
        <Link to="/admin/users" className="text-center text-decoration-none">
          <i className="bi bi-people fs-1 text-dark"></i>
          <div style={{ color: "black" }}>User Management</div>
        </Link>
        <Link to="/admin/reports" className="text-center text-decoration-none">
          <i className="bi bi-graph-up fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Reports & Analytics</div>
        </Link>
        <Link to="/admin/faqs" className="text-center text-decoration-none">
          {" "}
          <i className="bi bi-patch-question fs-1 text-dark"></i>
          <div style={{ color: "black" }}> Manage FAQs</div>{" "}
        </Link>{" "}
        <Link
          to="/admin/notifications"
          className="text-center text-decoration-none"
        >
          <i className="bi bi-bell fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Notifications</div>{" "}
        </Link>
        <div className="text-center">
          <div
            className="dropdown"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <i
              className="bi bi-person-circle fs-1 text-dark dropdown-toggle"
              role="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
            ></i>
            <div style={{ color: "black" }}>Menu</div>

            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="profileDropdown"
            >
              <li>
                <a className="dropdown-item text-danger" href="#" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>{" "}
    </header>
  );
}
