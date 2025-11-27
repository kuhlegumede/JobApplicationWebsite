import { EmployerJobCard } from "./EmployerJobCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { jobService } from "../services/jobService";
import { applicationService } from "../services/applicationService";

export function EmployerJobList({ jobs = [], onJobsChange }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidateModal, setCandidateModal] = useState({
    show: false,
    candidate: null,
  });
  const [applications, setApplications] = useState([]);

  const handleDeletePosting = async () => {
    console.log("Selected job:", selectedJob);
    const jobId = selectedJob.jobPostId;
    console.log("Deleting ID:", jobId);

    try {
      await jobService.deleteJobPost(jobId);

      // Update parent component's jobs state
      if (onJobsChange) {
        const updatedJobs = jobs.filter(
          (job) => (job.jobPostId || job.id) !== jobId
        );
        onJobsChange(updatedJobs);
      }

      handleClose();
      alert("Job deleted successfully!"); // Success feedback
    } catch (err) {
      console.error("Delete error:", err); // Log the actual error
      alert(`Failed to delete job: ${err.message}`); // Show specific error
    }
  };

  const handleUpdatePosting = async (e) => {
    e.preventDefault();
    try {
      const jobId = selectedJob.jobPostId;
      const updatedJob = {
        jobTitle: e.target.elements.title.value,
        description: e.target.elements.description.value,
        requirements: e.target.elements.requirements.value,
        salaryRange: e.target.elements.salaryRange.value,
        location: e.target.elements.location.value,
        postedDate: e.target.elements.postedDate.value,
        deadlineDate: e.target.elements.deadlineDate.value,
      };

      const result = await jobService.updateJobPost(jobId, updatedJob);

      // Update parent component's jobs state
      if (onJobsChange) {
        const updatedJobs = jobs.map((job) =>
          (job.jobPostId || job.id) === jobId ? result : job
        );
        onJobsChange(updatedJobs);
      }

      handleClose();
      alert("Job updated successfully!"); // Success feedback
    } catch (err) {
      console.error("Update error:", err); // Log the actual error
      alert(`Failed to update job: ${err.message}`); // Show specific error
    }
  };

  const onApplicationAction = (jobId, appId, action) => {
    setSelectedJob((prev) => {
      if (!prev) return prev;

      const updatedApplications = prev.applications.map((app) =>
        app.id === appId ? { ...app, status: action } : app
      );

      return { ...prev, applications: updatedApplications };
    });

    alert(`Application ${appId} for job ${jobId} ${action}`);
  };

  const handleManage = (job) => {
    setSelectedJob(job);
    setModalAction("manage");
    setShowModal(true);
    // Load applications for this job
    loadApplicationsForJob(job.jobPostId);
  };

  const loadApplicationsForJob = async (jobPostId) => {
    try {
      const apps = await applicationService.getApplicationsByJobPost(jobPostId);
      setApplications(apps);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setApplications([]);
    }
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/employer/applicants/${jobId}`);
  };

  const handleEdit = () => setModalAction("edit");
  const handleDelete = () => setModalAction("delete");
  const handleClose = () => {
    setShowModal(false);
    setModalAction(null);
    setSelectedJob(null);
  };

  function toDateInputValue(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (!jobs || jobs.length === 0) {
    return <p>No jobs have been added.</p>;
  }

  return (
    <>
      {jobs.map((job) => (
        <EmployerJobCard
          key={job.jobPostId || job.id}
          title={job.title}
          requirements={job.requirements}
          salaryRange={job.salaryRange}
          location={job.location}
          postedDate={new Date(job.postedDate).toLocaleDateString()}
          deadLineDate={new Date(job.deadLineDate).toLocaleDateString()}
          description={job.description}
        >
          <button
            className="btn btn-primary rounded-pill w-50 mb-2"
            onClick={() => handleManage(job)}
          >
            Manage posting
          </button>
          <button
            className="btn btn-info rounded-pill w-50"
            onClick={() => handleViewApplicants(job.jobPostId || job.id)}
          >
            View Applicants
          </button>
        </EmployerJobCard>
      ))}

      {showModal && (
        <Modal onClose={handleClose}>
          {modalAction === "manage" && (
            <>
              <h2>Manage Posting</h2>

              <div className="mb-3">
                <div className="alert alert-info">
                  <strong>Applications Received:</strong> {applications.length}
                  <br />
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={() => {
                      handleClose();
                      handleViewApplicants(selectedJob.jobPostId || selectedJob.id);
                    }}
                  >
                    View All Applicants
                  </button>
                </div>
              </div>

              {Array.isArray(selectedJob.applications) &&
                selectedJob.applications.length > 0 && (
                  <div className="mt-3">
                    <h5>Applications:</h5>
                    <table className="table table-bordered align-middle">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Status</th>
                          <th>Actions</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedJob.applications.map((app) => (
                          <tr key={app.id}>
                            <td>{app.candidate}</td>
                            <td className="text-capitalize">{app.status}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm me-2"
                                onClick={() =>
                                  onApplicationAction(
                                    selectedJob.jobId,
                                    app.id,
                                    "accepted"
                                  )
                                }
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  onApplicationAction(
                                    selectedJob.jobId,
                                    app.id,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() =>
                                  setCandidateModal({
                                    show: true,
                                    candidate: app.profile || {
                                      name: app.candidate,
                                      email: app.email || "unknown@email.com",
                                      phone: app.phone || "N/A",
                                      summary:
                                        app.summary || "No summary provided.",
                                      cvUrl: app.cvUrl || "#",
                                    },
                                  })
                                }
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              <div className="mb-3">
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={handleEdit}
                >
                  Edit Posting
                </button>
              </div>
              <div className="mb-3">
                <button
                  className="btn btn-danger rounded-pill"
                  onClick={handleDelete}
                >
                  Delete Posting
                </button>
              </div>
            </>
          )}

          {modalAction === "edit" && selectedJob && (
            <>
              <h2>Edit Posting</h2>
              <form onSubmit={handleUpdatePosting}>
                <div className="mb-3">
                  <label htmlFor="jobTitle" className="form-label">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="jobTitle"
                    defaultValue={selectedJob.title}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="requirements" className="form-label">
                    Requirements
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="requirements"
                    defaultValue={selectedJob.requirements}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="salaryRange" className="form-label">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="salaryRange"
                    defaultValue={selectedJob.salaryRange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    defaultValue={selectedJob.location}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="deadlineDate" className="form-label">
                    Deadline
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="deadlineDate"
                    defaultValue={toDateInputValue(selectedJob.deadlineDate)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control paragraph-input"
                    id="description"
                    rows={4}
                    defaultValue={selectedJob.description}
                  />
                </div>
                <div className="d-flex justify-content-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </>
          )}

          {modalAction === "delete" && (
            <>
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this posting?</p>
              <button
                className="btn btn-danger rounded-pill"
                onClick={handleDeletePosting}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary rounded-pill ms-2"
                onClick={handleClose}
              >
                Cancel
              </button>
            </>
          )}
        </Modal>
      )}

      {candidateModal.show && (
        <Modal
          onClose={() => setCandidateModal({ show: false, candidate: null })}
        >
          <h3>Candidate Profile</h3>
          <p>
            <strong>Name:</strong> {candidateModal.candidate.name}
          </p>
          <p>
            <strong>Date of Birth:</strong> {candidateModal.candidate.summary}
          </p>
          <p>
            <strong>Gender:</strong> {candidateModal.candidate.summary}
          </p>
          <p>
            <strong>Email:</strong> {candidateModal.candidate.email}
          </p>
          <p>
            <strong>Phone:</strong> {candidateModal.candidate.phone}
          </p>
          <p>
            <strong>Address:</strong> {candidateModal.candidate.summary}
          </p>
          <p>
            <strong>CV:</strong>{" "}
            <a
              href={candidateModal.candidate.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download CV
            </a>
          </p>
        </Modal>
      )}
    </>
  );
}
