import React, { useState, useEffect } from "react";
import { applicationService } from "../services/applicationService";
import { uploadCV } from "../services/fileService";

export function ApplicationModal({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUploadLoading, setResumeUploadLoading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState("");
  const [resumeFileId, setResumeFileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // Helper function to get job seeker ID from localStorage
  const getJobSeekerIdFromStorage = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      // Try multiple possible locations
      return (
        storedUser?.roleData?.jobSeekerId ||  // New structure from updated login
        storedUser?.jobSeeker?.jobSeekerId || // Old structure
        storedUser?.jobSeekerId ||            // Direct property
        null
      );
    } catch (error) {
      console.error("Error reading jobSeeker ID from localStorage:", error);
      return null;
    }
  };

  const checkIfAlreadyApplied = async () => {
    try {
      const jobSeekerId = getJobSeekerIdFromStorage();
      
      if (jobSeekerId) {
        const applications = await applicationService.getMyApplications(jobSeekerId);
        const hasApplied = applications.some(app => app.jobPostId === job.jobPostId);
        setAlreadyApplied(hasApplied);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    } finally {
      setCheckingApplication(false);
    }
  };

  useEffect(() => {
    console.log("ApplicationModal mounted for job:", job);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Check if user has already applied to this job
    checkIfAlreadyApplied();
    
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    setResumeUploadError("");
    if (!file) return;
    setResumeUploadLoading(true);
    try {
      const token = localStorage.getItem("token");
      const jobSeekerId = getJobSeekerIdFromStorage();
      
      if (!token) throw new Error("User not authenticated");
      if (!jobSeekerId) throw new Error("Job seeker profile not found. Please complete your profile first.");
      
      const uploadResult = await uploadCV(token, jobSeekerId, file);
      console.log("Upload result:", uploadResult);
      
      // Backend returns { success, message, fileData: { fileId, filePath, ... } }
      const fileId = uploadResult?.fileData?.fileId || uploadResult?.fileId;
      console.log("Extracted fileId:", fileId);
      
      if (!fileId) {
        throw new Error("Upload succeeded but no file ID returned");
      }
      
      setResumeFileId(String(fileId));
    } catch (err) {
      console.error("Resume upload error:", err);
      setResumeUploadError(err.message || "Resume upload failed");
    } finally {
      setResumeUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const jobSeekerId = getJobSeekerIdFromStorage();
      
      if (!token) throw new Error("User not authenticated");
      if (!jobSeekerId) throw new Error("Job seeker profile not found. Please complete your profile first.");
      if (!resumeFileId) throw new Error("Please upload your resume");
      
      await applicationService.applyForJob(job.jobPostId, {
        jobSeekerId,
        coverLetter,
        resume: resumeFileId,
        dateApplied: new Date().toISOString(),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Apply for {job.title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {job.companyName && (
                <p className="text-muted mb-3">
                  <i className="bi bi-building me-2"></i>
                  {job.companyName}
                </p>
              )}
              {checkingApplication ? (
                <div className="text-center py-4">
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Checking application status...
                </div>
              ) : alreadyApplied ? (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  You have already applied to this job. Please check your applications page for updates.
                </div>
              ) : success ? (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Application submitted successfully!
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label htmlFor="coverLetter" className="form-label">
                      Cover Letter <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="coverLetter"
                      className="form-control"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      placeholder="Tell us why you're a great fit for this position..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="resume" className="form-label">
                      Resume <span className="text-danger">*</span>
                    </label>
                    <input
                      id="resume"
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      disabled={resumeUploadLoading}
                    />
                    <small className="form-text text-muted">Accepted formats: PDF, DOC, DOCX (Max 5MB)</small>
                    {resumeUploadLoading && (
                      <div className="text-info mt-2">
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading resume...
                      </div>
                    )}
                    {resumeUploadError && (
                      <div className="alert alert-danger mt-2 py-2">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {resumeUploadError}
                      </div>
                    )}
                    {resumeFileId && (
                      <div className="alert alert-success mt-2 py-2">
                        <i className="bi bi-check-circle me-2"></i>
                        Resume uploaded successfully!
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="alert alert-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                {alreadyApplied ? 'Close' : 'Cancel'}
              </button>
              {!success && !alreadyApplied && !checkingApplication && (
                <button 
                  type="submit"
                  className="btn btn-primary" 
                  disabled={loading || !resumeFileId || resumeUploadLoading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
