import { useState, useEffect } from "react";
import { EmployerHeader } from "../../components/EmployerHeader";
import { Footer } from "../../components/Footer";
import { EditInterviewModal } from "../../components/EditInterviewModal";
import { interviewService } from "../../services/interviewService";
import { getEmployerIdFromStorage } from "../../utils/employerUtils";
import "../../index.css";

export function EmployerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [filterType, setFilterType] = useState("all"); // 'all', 'upcoming', 'past', 'today'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviews, filterType, searchTerm]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Use the utility function to get employer ID
      const { employerId, error: empError } = getEmployerIdFromStorage();
      
      if (empError || !employerId) {
        setError(empError || "Employer ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const allInterviews = await interviewService.getAllInterviews();
      
      // Filter interviews for this employer's job posts
      const employerInterviews = allInterviews.filter((interview) => {
        // Check if the interview has job application with job post
        return interview.jobApplication?.jobPost?.employerId === employerId;
      });

      setInterviews(employerInterviews);
    } catch (err) {
      console.error("Error loading interviews:", err);
      setError("Failed to load interviews: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter by type
    switch (filterType) {
      case "upcoming":
        filtered = filtered.filter(
          (interview) => new Date(interview.scheduleDate) >= now
        );
        break;
      case "past":
        filtered = filtered.filter(
          (interview) => new Date(interview.scheduleDate) < now
        );
        break;
      case "today":
        filtered = filtered.filter((interview) => {
          const interviewDate = new Date(interview.scheduleDate);
          return interviewDate >= today && interviewDate < tomorrow;
        });
        break;
      default:
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((interview) => {
        const applicantName = `${
          interview.jobApplication?.jobSeeker?.user?.firstName || ""
        } ${
          interview.jobApplication?.jobSeeker?.user?.lastName || ""
        }`.toLowerCase();
        const jobTitle =
          interview.jobApplication?.jobPost?.title?.toLowerCase() || "";
        return (
          applicantName.includes(searchTerm.toLowerCase()) ||
          jobTitle.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));

    setFilteredInterviews(filtered);
  };

  const handleEditInterview = (interview) => {
    setSelectedInterview(interview);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedInterview(null);
  };

  const handleModalSuccess = () => {
    loadInterviews();
  };

  const getInterviewModeIcon = (mode) => {
    switch (mode) {
      case "Online":
        return "bi-camera-video";
      case "InPerson":
        return "bi-building";
      case "Phone":
        return "bi-telephone";
      default:
        return "bi-calendar";
    }
  };

  const getInterviewModeColor = (mode) => {
    switch (mode) {
      case "Online":
        return "primary";
      case "InPerson":
        return "success";
      case "Phone":
        return "info";
      default:
        return "secondary";
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) >= new Date();
  };

  const isToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const interviewDate = new Date(date);
    return interviewDate >= today && interviewDate < tomorrow;
  };

  return (
    <div className="background">
      <EmployerHeader />

      <div className="container my-4">
        <div className="card shadow p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Interview Schedule</h2>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${
                  viewMode === "list" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewMode("list")}
              >
                <i className="bi bi-list-ul me-1"></i>
                List View
              </button>
              <button
                type="button"
                className={`btn ${
                  viewMode === "calendar"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setViewMode("calendar")}
              >
                <i className="bi bi-calendar3 me-1"></i>
                Calendar View
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by applicant or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Interviews</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={loadInterviews}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>

          {/* Statistics */}
          {!loading && interviews.length > 0 && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">{interviews.length}</h5>
                    <p className="card-text">Total Interviews</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      {
                        interviews.filter((i) => isToday(i.scheduleDate))
                          .length
                      }
                    </h5>
                    <p className="card-text">Today</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      {
                        interviews.filter((i) => isUpcoming(i.scheduleDate))
                          .length
                      }
                    </h5>
                    <p className="card-text">Upcoming</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      {
                        interviews.filter((i) => !isUpcoming(i.scheduleDate))
                          .length
                      }
                    </h5>
                    <p className="card-text">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="alert alert-info">
              {interviews.length === 0
                ? "No interviews scheduled yet."
                : "No interviews match your filters."}
            </div>
          ) : viewMode === "list" ? (
            <div className="list-group">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview.interviewId}
                  className={`list-group-item list-group-item-action ${
                    isToday(interview.scheduleDate) ? "border-warning border-3" : ""
                  }`}
                >
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5 className="mb-1">
                        {interview.jobApplication?.jobSeeker?.user?.firstName}{" "}
                        {interview.jobApplication?.jobSeeker?.user?.lastName}
                      </h5>
                      <p className="mb-1">
                        <strong>Position:</strong>{" "}
                        {interview.jobApplication?.jobPost?.title}
                      </p>
                      <p className="mb-1">
                        <i className="bi bi-calendar me-2"></i>
                        <strong>Date:</strong>{" "}
                        {new Date(interview.scheduleDate).toLocaleString()}
                        {isToday(interview.scheduleDate) && (
                          <span className="badge bg-warning text-dark ms-2">
                            TODAY
                          </span>
                        )}
                      </p>
                      <p className="mb-1">
                        <i
                          className={`bi ${getInterviewModeIcon(
                            interview.mode
                          )} me-2`}
                        ></i>
                        <span
                          className={`badge bg-${getInterviewModeColor(
                            interview.mode
                          )}`}
                        >
                          {interview.mode}
                        </span>
                      </p>
                      {interview.notes && (
                        <p className="mb-1 text-muted">
                          <small>
                            <i className="bi bi-sticky me-2"></i>
                            {interview.notes}
                          </small>
                        </p>
                      )}
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEditInterview(interview)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row">
              {filteredInterviews.map((interview) => (
                <div key={interview.interviewId} className="col-md-6 mb-3">
                  <div
                    className={`card h-100 ${
                      isToday(interview.scheduleDate)
                        ? "border-warning border-3"
                        : ""
                    }`}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title">
                          {interview.jobApplication?.jobSeeker?.user?.firstName}{" "}
                          {interview.jobApplication?.jobSeeker?.user?.lastName}
                        </h6>
                        {isToday(interview.scheduleDate) && (
                          <span className="badge bg-warning text-dark">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="card-text mb-2">
                        <strong>Position:</strong>{" "}
                        {interview.jobApplication?.jobPost?.title}
                      </p>
                      <p className="card-text mb-2">
                        <i className="bi bi-calendar me-2"></i>
                        {new Date(interview.scheduleDate).toLocaleDateString()}
                        <br />
                        <i className="bi bi-clock me-2"></i>
                        {new Date(interview.scheduleDate).toLocaleTimeString()}
                      </p>
                      <p className="card-text mb-2">
                        <span
                          className={`badge bg-${getInterviewModeColor(
                            interview.mode
                          )}`}
                        >
                          <i
                            className={`bi ${getInterviewModeIcon(
                              interview.mode
                            )} me-1`}
                          ></i>
                          {interview.mode}
                        </span>
                      </p>
                      {interview.notes && (
                        <p className="card-text">
                          <small className="text-muted">{interview.notes}</small>
                        </p>
                      )}
                      <button
                        className="btn btn-sm btn-primary w-100 mt-2"
                        onClick={() => handleEditInterview(interview)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit Interview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditModal && selectedInterview && (
        <EditInterviewModal
          interview={selectedInterview}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      <Footer />
    </div>
  );
}
