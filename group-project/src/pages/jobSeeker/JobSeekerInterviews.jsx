import React, { useState, useEffect } from "react";
import { JobSeekerHeader } from "../../components/JobSeekerHeader";
import { interviewService } from "../../services/interviewService";
import { InterviewDetailsModal } from "../../components/jobSeeker/InterviewDetailsModal";

export function JobSeekerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, today, past
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first, asc = oldest first
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    filterAndSortInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviews, filter, sortOrder]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError("");
      
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const jobSeekerId = storedUser?.roleData?.jobSeekerId || storedUser?.jobSeeker?.jobSeekerId;

      if (!jobSeekerId) {
        setError("Job seeker profile not found. Please complete your profile.");
        return;
      }

      const data = await interviewService.getInterviewsByJobSeeker(jobSeekerId);
      setInterviews(data || []);
    } catch (err) {
      console.error("Error loading interviews:", err);
      setError("Failed to load interviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInterviews = () => {
    let filtered = [...interviews];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Apply filter
    switch (filter) {
      case "upcoming":
        filtered = filtered.filter(
          (interview) => new Date(interview.scheduleDate) >= now
        );
        break;
      case "today":
        filtered = filtered.filter((interview) => {
          const interviewDate = new Date(interview.scheduleDate);
          return interviewDate >= today && interviewDate < tomorrow;
        });
        break;
      case "past":
        filtered = filtered.filter(
          (interview) => new Date(interview.scheduleDate) < now
        );
        break;
      default:
        // "all" - no filtering
        break;
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduleDate);
      const dateB = new Date(b.scheduleDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredInterviews(filtered);
  };

  const getStatistics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      total: interviews.length,
      upcoming: interviews.filter((i) => new Date(i.scheduleDate) >= now).length,
      today: interviews.filter((i) => {
        const interviewDate = new Date(i.scheduleDate);
        return interviewDate >= today && interviewDate < tomorrow;
      }).length,
      past: interviews.filter((i) => new Date(i.scheduleDate) < now).length,
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInterviewStatus = (scheduleDate) => {
    const now = new Date();
    const interviewDate = new Date(scheduleDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (interviewDate >= today && interviewDate < tomorrow) {
      return { label: "Today", className: "bg-warning text-dark" };
    } else if (interviewDate >= now) {
      return { label: "Upcoming", className: "bg-success" };
    } else {
      return { label: "Past", className: "bg-secondary" };
    }
  };

  const stats = getStatistics();

  return (
    <>
      <JobSeekerHeader />
      <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Interviews</h2>
            <button className="btn btn-outline-primary" onClick={loadInterviews}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="mb-0">{stats.total}</h3>
                  <p className="text-muted mb-0">Total Interviews</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="mb-0 text-success">{stats.upcoming}</h3>
                  <p className="text-muted mb-0">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="mb-0 text-warning">{stats.today}</h3>
                  <p className="text-muted mb-0">Today</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="mb-0 text-secondary">{stats.past}</h3>
                  <p className="text-muted mb-0">Past</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label className="form-label">Filter by:</label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${
                        filter === "all" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setFilter("all")}
                    >
                      All ({stats.total})
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        filter === "today" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setFilter("today")}
                    >
                      Today ({stats.today})
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        filter === "upcoming" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setFilter("upcoming")}
                    >
                      Upcoming ({stats.upcoming})
                    </button>
                    <button
                      type="button"
                      className={`btn ${
                        filter === "past" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setFilter("past")}
                    >
                      Past ({stats.past})
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Sort by Date:</label>
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Interviews List */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading interviews...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x" style={{ fontSize: "4rem", color: "#ccc" }}></i>
              <h4 className="mt-3">No Interviews Found</h4>
              <p className="text-muted">
                {filter === "all"
                  ? "You don't have any scheduled interviews yet."
                  : `No ${filter} interviews found.`}
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {filteredInterviews.map((interview) => {
                const status = getInterviewStatus(interview.scheduleDate);
                return (
                  <div key={interview.interviewId} className="col-12">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="card-title mb-1">
                              {interview.jobApplication?.jobPost?.title || "Interview"}
                            </h5>
                            <p className="text-muted mb-0">
                              <i className="bi bi-building me-2"></i>
                              {interview.jobApplication?.jobPost?.location || "N/A"}
                            </p>
                          </div>
                          <span className={`badge ${status.className}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-md-4">
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-2"></i>
                              Date
                            </small>
                            <p className="mb-0">{formatDate(interview.scheduleDate)}</p>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted">
                              <i className="bi bi-clock me-2"></i>
                              Time
                            </small>
                            <p className="mb-0">{formatTime(interview.scheduleDate)}</p>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted">
                              <i className="bi bi-laptop me-2"></i>
                              Mode
                            </small>
                            <p className="mb-0">{interview.interviewMode}</p>
                          </div>
                        </div>

                        {interview.notes && (
                          <div className="alert alert-info mb-3">
                            <small>
                              <strong>Notes:</strong> {interview.notes}
                            </small>
                          </div>
                        )}

                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowDetailsModal(true);
                          }}
                        >
                          <i className="bi bi-eye me-2"></i>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interview Details Modal */}
      {showDetailsModal && selectedInterview && (
        <InterviewDetailsModal
          interview={selectedInterview}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </>
  );
}
