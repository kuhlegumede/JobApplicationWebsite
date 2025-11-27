import { AdminHeader } from "../../components/AdminHeader";
import { Footer } from "../../components/Footer";
import { Modal } from "../../components/Modal";
import { useState, useEffect } from "react";
import { jobService } from "../../services/jobService";

export function AdminHomePage() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    console.log("AdminHomePage mounted");
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getAllJobPosts();
      console.log("getAllJobPosts returned:", data);
      setJobPosts(data);
      setError("");
    } catch (err) {
      setError("Failed to load job posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    try {
      await jobService.deleteJobPost(selectedJob.jobPostId);
      setJobPosts((prev) =>
        prev.filter((job) => job.jobPostId !== selectedJob.jobPostId)
      );
      setSelectedJob(null);
      setShowDeleteModal(false);
    } catch (err) {
      setError("Failed to delete job post");
      console.error(err);
    }
  };

  const handleOpenDelete = (job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="background">
        <AdminHeader />
        <div className="container my-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? (
            <div className="text-center">Loading job posts...</div>
          ) : (
            <div className="row justify-content-center">
              <div
                id="card-container"
                className="card shadow p-4 card-container"
                style={{ maxWidth: 1100 }}
              >
                <h2 className="mb-4">Job Post Management</h2>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Requirements</th>
                        <th>Salary</th>
                        <th>Location</th>
                        <th>Posted Date</th>
                        <th>Deadline</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobPosts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-muted">
                            No job posts found.
                          </td>
                        </tr>
                      ) : (
                        jobPosts.map((job) => (
                          <tr key={job.jobPostId}>
                            <td>{job.title}</td>
                            <td>{job.description}</td>
                            <td>{job.requirements}</td>
                            <td>{job.salaryRange}</td>
                            <td>{job.location}</td>
                            <td>
                              {new Date(job.postedDate).toLocaleDateString()}
                            </td>
                            <td>
                              {new Date(job.deadLineDate).toLocaleDateString()}
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleOpenDelete(job)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />

        {showDeleteModal && selectedJob && (
          <Modal onClose={() => setShowDeleteModal(false)}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the job post{" "}
              <strong>{selectedJob.title}</strong>?
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
