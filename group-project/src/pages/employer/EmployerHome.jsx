import { EmployerJobList } from "../../components/EmployerJobList";
import { EmployerHeader } from "../../components/EmployerHeader";
import { Footer } from "../../components/Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { jobService } from "../../services/jobService";
import "../../index.css";
import { Modal } from "../../components/Modal";
import { getEmployerIdFromStorage } from "../../utils/employerUtils";
import { DebugUserInfo } from "../../components/DebugUserInfo";

export function EmployerHome() {
  const [showModal, setShowModal] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salaryRange: "",
    location: "",
    deadLineDate: "",
  });
  useEffect(() => {
    loadJobs();
  }, []);
  const loadJobs = async () => {
    try {
      // Use the utility function to get employer ID
      const { employerId, error: empError } = getEmployerIdFromStorage();
      
      if (empError || !employerId) {
        setError(empError || "Employer ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const allJobs = await jobService.getAllJobPosts();
      const filteredJobs = allJobs.filter(
        (job) => job.employerId === employerId
      );
      setJobs(filteredJobs);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Failed to load jobs: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newJob = await jobService.createJob(formData);
      setJobs((prevJobs) => [...prevJobs, newJob]);
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        requirements: "",
        salaryRange: "",
        location: "",
        deadLineDate: "",
      });
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error creating job:", err);
      setError(err.message || "Failed to create job");
      setShowModal(false); // Close modal to show error
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <>
      <div className="background">
        <EmployerHeader />

        <div className="container my-4">
          <div id="card-container" className="card shadow p-4 card-container">
            <button
              className="btn btn-primary  w-100"
              onClick={() => setShowModal(true)}
            >
              Add new job
            </button>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="text-center my-4">Loading jobs...</div>
            ) : (
              <EmployerJobList jobs={jobs} onJobsChange={setJobs} />
            )}

            {showModal && (
              <Modal onClose={() => setShowModal(false)}>
                <h2>New Job Posting</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Job Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
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
                      value={formData.location}
                      onChange={handleInputChange}
                      required
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
                      value={formData.salaryRange}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="deadLineDate" className="form-label">
                      Deadline
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="deadLineDate"
                      value={formData.deadLineDate}
                      onChange={handleInputChange}
                      required
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
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="requirements" className="form-label">
                      Requirements
                    </label>
                    <textarea
                      className="form-control paragraph-input"
                      id="requirements"
                      rows={4}
                      value={formData.requirements}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-center mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill"
                    >
                      Add Job
                    </button>
                  </div>
                </form>
              </Modal>
            )}
          </div>
        </div>

        <Footer />
      </div>
      <DebugUserInfo />
    </>
  );
}
