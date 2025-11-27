import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EmployerHeader } from "../../components/EmployerHeader";
import { Footer } from "../../components/Footer";
import { Modal } from "../../components/Modal";
import { ScheduleInterviewModal } from "../../components/ScheduleInterviewModal";
import { CVViewer } from "../../components/employer/CVViewer";
import ImagePreview from "../../components/ImagePreview";
import { applicationService } from "../../services/applicationService";
import { cvService } from "../../services/cvService";
import { getProfilePictureUrl } from "../../services/fileService";
import "../../index.css";

export function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dateApplied");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCVViewer, setShowCVViewer] = useState(false);
  const [selectedCVFileId, setSelectedCVFileId] = useState(null);
  const [selectedCVFileName, setSelectedCVFileName] = useState("");

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await applicationService.getApplicationsByJobPost(jobId);
      setApplicants(data);
    } catch (err) {
      setError("Failed to load applicants: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplicants = () => {
    let filtered = [...applicants];

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (app) => app.applicationStatus === statusFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const fullName = `${app.jobSeeker?.user?.firstName || ""} ${
          app.jobSeeker?.user?.lastName || ""
        }`.toLowerCase();
        const email = app.jobSeeker?.user?.email?.toLowerCase() || "";
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dateApplied":
          return new Date(b.dateApplied) - new Date(a.dateApplied);
        case "name": {
          const nameA = `${a.jobSeeker?.user?.firstName || ""} ${
            a.jobSeeker?.user?.lastName || ""
          }`;
          const nameB = `${b.jobSeeker?.user?.firstName || ""} ${
            b.jobSeeker?.user?.lastName || ""
          }`;
          return nameA.localeCompare(nameB);
        }
        case "status":
          return a.applicationStatus.localeCompare(b.applicationStatus);
        default:
          return 0;
      }
    });

    setFilteredApplicants(filtered);
  };

  useEffect(() => {
    if (jobId) {
      loadApplicants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    filterAndSortApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicants, searchTerm, statusFilter, sortBy]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.jobApplicationId === applicationId
            ? { ...app, applicationStatus: newStatus }
            : app
        )
      );
      
      alert("Application status updated successfully!");
    } catch (err) {
      alert("Failed to update status: " + err.message);
      console.error(err);
    }
  };

  const handleViewDetails = (applicant) => {
    console.log("Selected applicant:", applicant); // Debug log
    setSelectedApplicant(applicant);
    setShowDetailsModal(true);
  };

  const handleScheduleInterview = (applicant) => {
    setSelectedApplicant(applicant);
    setShowScheduleModal(true);
  };

  const handleScheduleSuccess = () => {
    loadApplicants();
  };

  const handleViewCV = (fileId, filename) => {
    setSelectedCVFileId(fileId);
    setSelectedCVFileName(filename || "resume.pdf");
    setShowCVViewer(true);
  };

  const handleDownloadCV = async (fileId, filename) => {
    try {
      await cvService.downloadAndSaveCV(fileId, filename);
    } catch (err) {
      alert("Failed to download CV: " + err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Submitted: "bg-primary",
      UnderReview: "bg-warning",
      Interview: "bg-info",
      Hired: "bg-success",
      Rejected: "bg-danger",
    };
    return statusMap[status] || "bg-secondary";
  };

  if (!jobId) {
    return (
      <div className="background">
        <EmployerHeader />
        <div className="container my-4">
          <div className="alert alert-warning">
            No job ID specified. Please select a job first.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="background">
      <EmployerHeader />

      <div className="container my-4">
        <div className="card shadow p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Job Applicants</h2>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/employer/home")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Jobs
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Filters and Search */}
          <div className="row mb-4">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="UnderReview">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="dateApplied">Date Applied</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={loadApplicants}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>

          {/* Applicants List */}
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="alert alert-info">
              {applicants.length === 0
                ? "No applicants yet for this job."
                : "No applicants match your filters."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => {
                    const profilePictureUrl = applicant.jobSeeker?.profilePictureFileId
                      ? getProfilePictureUrl(applicant.jobSeeker.profilePictureFileId)
                      : null;
                    
                    return (
                    <tr key={applicant.jobApplicationId}>
                      <td>
                        <ImagePreview
                          imageUrl={profilePictureUrl}
                          alt={`${applicant.jobSeeker?.user?.firstName} ${applicant.jobSeeker?.user?.lastName}`}
                          size="small"
                          shape="circle"
                        />
                      </td>
                      <td>
                        {applicant.jobSeeker?.user?.firstName}{" "}
                        {applicant.jobSeeker?.user?.lastName}
                      </td>
                      <td>{applicant.jobSeeker?.user?.email}</td>
                      <td>{applicant.jobSeeker?.phoneNumber}</td>
                      <td>
                        {new Date(applicant.dateApplied).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            applicant.applicationStatus
                          )}`}
                        >
                          {applicant.applicationStatus}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleViewDetails(applicant)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {applicant.interviewSchedule ? (
                            <button
                              className="btn btn-success btn-sm"
                              title="Interview Scheduled"
                              disabled
                            >
                              <i className="bi bi-calendar-check-fill"></i> Scheduled
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-info"
                              onClick={() => handleScheduleInterview(applicant)}
                              title="Schedule Interview"
                            >
                              <i className="bi bi-calendar-check"></i>
                            </button>
                          )}
                          {applicant.jobSeeker?.resumeFileId && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  handleViewCV(
                                    applicant.jobSeeker.resumeFileId,
                                    `${applicant.jobSeeker.user?.firstName}_${applicant.jobSeeker.user?.lastName}_CV.pdf`
                                  )
                                }
                                title="View CV"
                              >
                                <i className="bi bi-file-earmark-text"></i>
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  handleDownloadCV(
                                    applicant.jobSeeker.resumeFileId,
                                    `${applicant.jobSeeker.user?.firstName}_${applicant.jobSeeker.user?.lastName}_CV.pdf`
                                  )
                                }
                                title="Download CV"
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-outline-success"
                            onClick={() =>
                              handleStatusUpdate(
                                applicant.jobApplicationId,
                                "Hired"
                              )
                            }
                            title="Accept"
                            disabled={applicant.applicationStatus === "Hired"}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              handleStatusUpdate(
                                applicant.jobApplicationId,
                                "Rejected"
                              )
                            }
                            title="Reject"
                            disabled={applicant.applicationStatus === "Rejected"}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && applicants.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">{applicants.length}</h5>
                    <p className="card-text">Total Applicants</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      {
                        applicants.filter(
                          (a) => a.applicationStatus === "Submitted"
                        ).length
                      }
                    </h5>
                    <p className="card-text">New Applications</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      {
                        applicants.filter(
                          (a) => a.applicationStatus === "Interview"
                        ).length
                      }
                    </h5>
                    <p className="card-text">In Interview</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">
                      {
                        applicants.filter((a) => a.applicationStatus === "Hired")
                          .length
                      }
                    </h5>
                    <p className="card-text">Hired</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Details Modal */}
      {showDetailsModal && selectedApplicant && (
        <Modal onClose={() => setShowDetailsModal(false)}>
          <h3>Applicant Details</h3>
          <div className="mb-3">
            <strong>Name:</strong>{" "}
            {selectedApplicant.jobSeeker?.user?.firstName}{" "}
            {selectedApplicant.jobSeeker?.user?.lastName}
          </div>
          <div className="mb-3">
            <strong>Email:</strong> {selectedApplicant.jobSeeker?.user?.email}
          </div>
          <div className="mb-3">
            <strong>Phone:</strong> {selectedApplicant.jobSeeker?.phoneNumber}
          </div>
          <div className="mb-3">
            <strong>Skills:</strong> {selectedApplicant.jobSeeker?.skills}
          </div>
          <div className="mb-3">
            <strong>Education:</strong>{" "}
            {selectedApplicant.jobSeeker?.education}
          </div>
          <div className="mb-3">
            <strong>Experience:</strong>{" "}
            {selectedApplicant.jobSeeker?.experience || "Not specified"}
          </div>
          <div className="mb-3">
            <strong>Cover Letter:</strong>
            <div className="border p-2 mt-2">
              {selectedApplicant.coverLetter || "No cover letter provided"}
            </div>
          </div>
          <div className="mb-3">
            <strong>Application Date:</strong>{" "}
            {new Date(selectedApplicant.dateApplied).toLocaleString()}
          </div>
          <div className="mb-3">
            <strong>Status:</strong>{" "}
            <span
              className={`badge ${getStatusBadgeClass(
                selectedApplicant.applicationStatus
              )}`}
            >
              {selectedApplicant.applicationStatus}
            </span>
          </div>

          <div className="mb-3">
            <strong>Update Status:</strong>
            <div className="btn-group d-block mt-2" role="group">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() =>
                  handleStatusUpdate(
                    selectedApplicant.jobApplicationId,
                    "UnderReview"
                  )
                }
              >
                Under Review
              </button>
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() =>
                  handleStatusUpdate(
                    selectedApplicant.jobApplicationId,
                    "Interview"
                  )
                }
              >
                Interview
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() =>
                  handleStatusUpdate(
                    selectedApplicant.jobApplicationId,
                    "Hired"
                  )
                }
              >
                Hired
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() =>
                  handleStatusUpdate(
                    selectedApplicant.jobApplicationId,
                    "Rejected"
                  )
                }
              >
                Rejected
              </button>
            </div>
          </div>

          {selectedApplicant.jobSeeker?.resumeFileId && (
            <div className="mb-3 d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() =>
                  handleViewCV(
                    selectedApplicant.jobSeeker.resumeFileId,
                    `${selectedApplicant.jobSeeker.user?.firstName}_${selectedApplicant.jobSeeker.user?.lastName}_CV.pdf`
                  )
                }
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                View CV
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  handleDownloadCV(
                    selectedApplicant.jobSeeker.resumeFileId,
                    `${selectedApplicant.jobSeeker.user?.firstName}_${selectedApplicant.jobSeeker.user?.lastName}_CV.pdf`
                  )
                }
              >
                <i className="bi bi-download me-2"></i>
                Download CV
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedApplicant && (
        <ScheduleInterviewModal
          applicant={selectedApplicant}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {/* CV Viewer Modal */}
      {showCVViewer && (
        <CVViewer
          fileId={selectedCVFileId}
          fileName={selectedCVFileName}
          onClose={() => setShowCVViewer(false)}
        />
      )}

      <Footer />
    </div>
  );
}
