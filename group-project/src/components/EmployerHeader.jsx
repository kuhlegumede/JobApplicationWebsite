import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { messageService } from "../services/messageService";
import { NotificationBell } from "./NotificationBell";
import ImagePreview from "./ImagePreview";
import { getProfileData } from "../services/profileService";
import { getProfilePictureUrl } from "../services/fileService";
import { logout } from "../services/authUtils";
import NextStep from "../assets/NextStep.png";

export function EmployerHeader() {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  useEffect(() => {
    loadUnreadCount();
    loadCompanyLogo();

    // Set up periodic refresh
    const interval = setInterval(loadUnreadCount, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadMessageCount(count);
    } catch (error) {
      console.error("Error loading unread message count:", error);
    }
  };

  const loadCompanyLogo = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.userId;

      if (token && userId) {
        const data = await getProfileData(token, userId);
        if (data?.employer?.companyLogoFileId) {
          setCompanyLogoUrl(
            getProfilePictureUrl(data.employer.companyLogoFileId)
          );
        }
      }
    } catch (error) {
      console.error("Error loading company logo:", error);
    }
  };

  return (
    <header
      style={{ backgroundColor: "#eeebe8f1" }}
      className="d-flex align-items-center justify-content-between px-3 py-2"
    >
      {" "}
      <NavLink to="/employer/home">
        {" "}
        <img
          className="logo"
          src={NextStep}
          alt="Logo"
          style={{ width: "140px", height: "50px" }}
        />{" "}
      </NavLink>{" "}
      <div className="d-flex align-items-center gap-3">
        {" "}
        <NavLink
          to="/employer/home"
          className="text-center text-decoration-none"
        >
          {" "}
          <i className="bi bi-house fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Home</div>
        </NavLink>{" "}
        <NavLink
          to="/employer/interviews"
          className="text-center text-decoration-none"
        >
          {" "}
          <i className="bi bi-calendar-check fs-1 text-dark"></i>
          <div style={{ color: "black" }}>Interviews</div>
        </NavLink>{" "}
        <NavLink
          to="/employer/messages"
          className="text-center text-decoration-none position-relative"
        >
          {" "}
          <i className="bi bi-chat fs-1 text-dark"></i>
          {unreadMessageCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: "0.65rem" }}
            >
              {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
            </span>
          )}
          <div style={{ color: "black" }}>My Messages</div>
        </NavLink>{" "}
        <NavLink
          to="/employer/assessments"
          className="text-center text-decoration-none"
        >
          {" "}
          <i className="bi bi-pencil-square fs-1 text-dark"></i>{" "}
          <div style={{ color: "black" }}>My Assessments</div>
        </NavLink>{" "}
        <div className="text-center">
          <NotificationBell />
          <div style={{ color: "black" }}>Notifications</div>
        </div>
        <div className="text-center dropdown" style={{ width: "80px" }}>
          <div
            role="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
          >
            {companyLogoUrl ? (
              <ImagePreview
                imageUrl={companyLogoUrl}
                alt="Company Logo"
                size="small"
                shape="square"
              />
            ) : (
              <i className="bi bi-person-circle fs-1 text-dark"></i>
            )}
          </div>

          <div style={{ color: "black" }}>Menu</div>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="profileDropdown"
          >
            <li>
              <NavLink className="dropdown-item" to="/employer/profile">
                Profile
              </NavLink>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a
                className="dropdown-item text-danger"
                href="#"
                onClick={handleLogout}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>{" "}
    </header>
  );
}
