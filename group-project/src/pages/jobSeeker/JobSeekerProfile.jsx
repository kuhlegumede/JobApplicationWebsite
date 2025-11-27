import { useEffect, useState } from "react";
import { JobSeekerHeader } from "../../components/JobSeekerHeader";
import { Footer } from "../../components/Footer";
import { Modal } from "../../components/Modal";
import ProfilePictureUpload from "../../components/ProfilePictureUpload";
import ImagePreview from "../../components/ImagePreview";
import {
  getProfileData,
  updateJobSeekerProfile,
} from "../../services/profileService";
import {
  uploadCV,
  getCVInfo,
  downloadCV,
  deleteCV,
  uploadProfilePicture,
  getProfilePictureUrl,
} from "../../services/fileService";
import basic from "../../assets/basic.png";
export function JobSeekerProfile() {
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(basic);
  const [cvInfo, setCvInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [showProfilePictureUpload, setShowProfilePictureUpload] = useState(false);
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.userId;
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile with:", { token, userId });
        const data = await getProfileData(token, userId);
        console.log("Received profile data:", data);
        setProfileData(data);
        
        // Set profile picture if exists
        if (data?.jobSeeker?.profilePictureFileId) {
          setProfileImage(getProfilePictureUrl(data.jobSeeker.profilePictureFileId));
        }
        
        // Load CV information if jobSeeker exists
        if (data?.jobSeeker?.jobSeekerId) {
          try {
            const cvData = await getCVInfo(token, data.jobSeeker.jobSeekerId);
            setCvInfo(cvData);
          } catch (error) {
            console.log("No CV uploaded yet or error loading CV info:", error);
            setCvInfo(null);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    if (token && userId) fetchProfile();
  }, [token, userId]);
  const handleOpenModal = () => {
    if (!profileData?.jobSeeker) return;
    setFormData({
      phoneNumber: profileData.jobSeeker.phoneNumber || "",
      skills: profileData.jobSeeker.skills || "",
      education: profileData.jobSeeker.education || "",
      experience: profileData.jobSeeker.experience || "",
      coverLetter: profileData.jobSeeker.coverLetter || "",
    });
    setShowModal(true);
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      setUploadMessage("Uploading profile picture...");
      const result = await uploadProfilePicture(token, file);
      
      if (result.success) {
        setUploadMessage("Profile picture uploaded successfully!");
        
        // Refresh profile data to get the new picture
        const data = await getProfileData(token, userId);
        setProfileData(data);
        
        if (data?.jobSeeker?.profilePictureFileId) {
          setProfileImage(getProfilePictureUrl(data.jobSeeker.profilePictureFileId));
        }
        
        setShowProfilePictureUpload(false);
        setTimeout(() => setUploadMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setUploadMessage(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };
  
  const handleCvChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadMessage("Please select a PDF, DOC, or DOCX file.");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("File size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("Uploading CV...");

    try {
      await uploadCV(token, profileData.jobSeeker.jobSeekerId, file);
      setUploadMessage("CV uploaded successfully!");
      
      // Refresh CV info
      const cvData = await getCVInfo(token, profileData.jobSeeker.jobSeekerId);
      setCvInfo(cvData);
      
      // Clear the file input
      e.target.value = '';
      
      setTimeout(() => setUploadMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading CV:", error);
      setUploadMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!cvInfo?.fileId) return;
    
    try {
      await downloadCV(token, cvInfo.fileId);
    } catch (error) {
      console.error("Error downloading CV:", error);
      setUploadMessage(`Download failed: ${error.message}`);
      setTimeout(() => setUploadMessage(""), 3000);
    }
  };

  const handleDeleteCV = async () => {
    if (!cvInfo?.fileId) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete your CV?");
    if (!confirmDelete) return;
    
    try {
      await deleteCV(token, cvInfo.fileId);
      setCvInfo(null);
      setUploadMessage("CV deleted successfully!");
      setTimeout(() => setUploadMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting CV:", error);
      setUploadMessage(`Delete failed: ${error.message}`);
      setTimeout(() => setUploadMessage(""), 3000);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.skills?.trim()) {
      alert("Skills are required");
      return;
    }
    if (!formData.education?.trim()) {
      alert("Education is required");
      return;
    }
    if (!formData.phoneNumber?.trim()) {
      alert("Phone number is required");
      return;
    }

    const updatedData = {
      jobSeekerId: profileData.jobSeeker.jobSeekerId,
      userId: profileData.userId,
      resumeFileId: profileData.jobSeeker.resumeFileId || null,
      skills: formData.skills.trim(),
      experience: formData.experience?.trim() || "",
      education: formData.education.trim(),
      coverLetter: formData.coverLetter?.trim() || "",
      phoneNumber: formData.phoneNumber.trim(),
    };

    console.log("Payload being sent:", JSON.stringify(updatedData, null, 2));

    try {
      await updateJobSeekerProfile(
        token,
        profileData.jobSeeker.jobSeekerId,
        updatedData
      );

      alert("Profile updated successfully!");
      setShowModal(false);
      
      // Refresh the profile data instead of reloading the entire page
      const data = await getProfileData(token, userId);
      setProfileData(data);
      if (data?.jobSeeker) {
        setFormData({
          phoneNumber: data.jobSeeker.phoneNumber || "",
          skills: data.jobSeeker.skills || "",
          education: data.jobSeeker.education || "",
          experience: data.jobSeeker.experience || "",
          coverLetter: data.jobSeeker.coverLetter || "",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  if (!profileData || !profileData.jobSeeker) {
    return (
      <div className="background">
        {" "}
        <JobSeekerHeader />{" "}
        <div className="container my-4 text-center">
          {" "}
          <div className="spinner-border" role="status">
            {" "}
            <span className="visually-hidden">Loading...</span>{" "}
          </div>{" "}
        </div>{" "}
        <Footer />{" "}
      </div>
    );
  }
  return (
    <>
      {" "}
      <div className="background">
        {" "}
        <JobSeekerHeader />{" "}
        <div className="container my-4">
          {" "}
          <div className="row">
            {" "}
            <div
              className="card shadow p-4 mx-auto"
              style={{ border: "none", borderRadius: "10px", width: "900px" }}
            >
              {" "}
              <div className="text-center">
                {" "}
                {/* Profile Picture Section */}
                <div className="mb-4">
                  <ImagePreview
                    imageUrl={profileImage !== basic ? profileImage : null}
                    alt="Profile Picture"
                    size="large"
                    shape="circle"
                  />
                  <div className="mt-3">
                    {!showProfilePictureUpload ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowProfilePictureUpload(true)}
                      >
                        {profileImage !== basic ? 'Change Photo' : 'Add Photo'}
                      </button>
                    ) : (
                      <div className="mt-3">
                        <ProfilePictureUpload
                          currentImage={profileImage !== basic ? profileImage : null}
                          onUpload={handleProfilePictureUpload}
                          userType="jobseeker"
                          label="Profile Picture"
                        />
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-muted"
                          onClick={() => setShowProfilePictureUpload(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <h2>Basic Info</h2>{" "}
                <p>
                  {" "}
                  {profileData.firstName} {profileData.lastName}{" "}
                </p>{" "}
                <h2>Contact Info</h2> <p>Email: {profileData.email}</p>{" "}
                <p>
                  {" "}
                  Phone: {profileData.jobSeeker.phoneNumber ||
                    "Not provided"}{" "}
                </p>{" "}
                <h2>Skills & Education</h2>{" "}
                <p>Skills: {profileData.jobSeeker.skills || "N/A"}</p>{" "}
                <p>Education: {profileData.jobSeeker.education || "N/A"}</p>{" "}
                <h2>Experience</h2>{" "}
                <p>{profileData.jobSeeker.experience || "N/A"}</p>{" "}
                {profileData.jobSeeker.coverLetter && (
                  <>
                    <h2>Cover Letter</h2>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {profileData.jobSeeker.coverLetter}
                    </p>
                  </>
                )}
                <div className="my-3">
                  <h5>CV</h5>
                  
                  {/* Upload message */}
                  {uploadMessage && (
                    <div className={`alert ${uploadMessage.includes('failed') || uploadMessage.includes('error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">
                      {uploadMessage}
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setUploadMessage("")}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}
                  
                  {/* CV display and actions */}
                  {cvInfo ? (
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="alert alert-info d-flex align-items-center justify-content-between w-100">
                        <div>
                          <i className="bi bi-file-earmark-pdf me-2"></i>
                          <strong>{cvInfo.originalFileName}</strong>
                          <br />
                          <small className="text-muted">
                            Uploaded: {new Date(cvInfo.uploadDate).toLocaleDateString()} • 
                            Size: {(cvInfo.fileSize / 1024).toFixed(1)} KB
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleDownloadCV}
                            title="Download CV"
                          >
                            <i className="bi bi-download"></i> Download
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDeleteCV}
                            title="Delete CV"
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted mb-3">No CV uploaded yet</p>
                    </div>
                  )}
                  
                  {/* Upload button */}
                  <div className="text-center mt-3">
                    <label className={`btn ${cvInfo ? 'btn-outline-secondary' : 'btn-primary'} btn-sm ${isUploading ? 'disabled' : ''}`}>
                      {isUploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-upload me-2"></i>
                          {cvInfo ? 'Replace CV' : 'Upload CV'}
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: "none" }}
                        onChange={handleCvChange}
                        disabled={isUploading}
                      />
                    </label>
                    <div className="form-text mt-2">
                      Accepted formats: PDF, DOC, DOCX (Max 5MB)
                    </div>
                  </div>
                </div>{" "}
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={handleOpenModal}
                >
                  {" "}
                  Edit Profile{" "}
                </button>{" "}
                {showModal && (
                  <Modal onClose={() => setShowModal(false)}>
                    {" "}
                    <form onSubmit={handleUpdateProfile}>
                      {" "}
                      <h2>Edit Profile</h2>{" "}
                      <div className="mb-3">
                        {" "}
                        <label htmlFor="phoneNumber" className="form-label">
                          {" "}
                          Phone Number <span className="text-danger">*</span>
                        </label>{" "}
                        <input
                          type="tel"
                          className="form-control"
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="+1234567890"
                        />{" "}
                      </div>{" "}
                      <div className="mb-3">
                        {" "}
                        <label htmlFor="skills" className="form-label">
                          {" "}
                          Skills <span className="text-danger">*</span>
                        </label>{" "}
                        <input
                          type="text"
                          className="form-control"
                          id="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          required
                          maxLength={500}
                          placeholder="e.g., JavaScript, React, Node.js"
                        />{" "}
                        <small className="text-muted">
                          {formData.skills?.length || 0}/500 characters
                        </small>
                      </div>{" "}
                      <div className="mb-3">
                        {" "}
                        <label htmlFor="education" className="form-label">
                          {" "}
                          Education <span className="text-danger">*</span>
                        </label>{" "}
                        <input
                          type="text"
                          className="form-control"
                          id="education"
                          value={formData.education}
                          onChange={handleInputChange}
                          required
                          maxLength={500}
                          placeholder="e.g., Bachelor's in Computer Science"
                        />{" "}
                        <small className="text-muted">
                          {formData.education?.length || 0}/500 characters
                        </small>
                      </div>{" "}
                      <div className="mb-3">
                        {" "}
                        <label htmlFor="experience" className="form-label">
                          {" "}
                          Experience{" "}
                        </label>{" "}
                        <textarea
                          className="form-control"
                          id="experience"
                          rows="3"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="Describe your work experience..."
                        />{" "}
                      </div>{" "}
                      <div className="mb-3">
                        {" "}
                        <label htmlFor="coverLetter" className="form-label">
                          {" "}
                          Cover Letter{" "}
                        </label>{" "}
                        <textarea
                          className="form-control"
                          id="coverLetter"
                          rows="4"
                          value={formData.coverLetter}
                          onChange={handleInputChange}
                          maxLength={1000}
                          placeholder="Write a brief cover letter..."
                        />{" "}
                        <small className="text-muted">
                          {formData.coverLetter?.length || 0}/1000 characters
                        </small>
                      </div>{" "}
                      <div className="d-flex justify-content-center mt-3">
                        {" "}
                        <button
                          type="submit"
                          className="btn btn-primary rounded-pill"
                        >
                          {" "}
                          Update Profile{" "}
                        </button>{" "}
                      </div>{" "}
                    </form>{" "}
                  </Modal>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <Footer />{" "}
      </div>{" "}
    </>
  );
}
