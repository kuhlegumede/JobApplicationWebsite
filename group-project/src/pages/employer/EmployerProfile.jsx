import { useEffect, useState } from "react";
import { EmployerHeader } from "../../components/EmployerHeader";
import { Footer } from "../../components/Footer";
import { Modal } from "../../components/Modal";
import ProfilePictureUpload from "../../components/ProfilePictureUpload";
import ImagePreview from "../../components/ImagePreview";
import basic from "../../assets/basic.png";
import {
  getProfileData,
  updateEmployerProfile,
} from "../../services/profileService";
import {
  uploadCompanyLogo,
  getProfilePictureUrl,
} from "../../services/fileService";
import "./EmployerProfile.css";

export function EmployerProfile() {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(basic);
  const [showModal, setShowModal] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.userId;

  // Fetch employer profile
  useEffect(() => {
    if (!token || !userId) return;

    const fetchProfile = async () => {
      try {
        const data = await getProfileData(token, userId);
        setProfileData(data);

        // Set company logo if exists
        if (data?.employer?.companyLogoFileId) {
          setProfileImage(getProfilePictureUrl(data.employer.companyLogoFileId));
        }

        if (data.employer) {
          setFormData({
            companyName: data.employer.companyName || "",
            companyDescription: data.employer.companyDescription || "",
            location: data.employer.location || "",
            website: data.employer.website || "",
          });
        }
      } catch (error) {
        console.error("Error loading employer profile:", error);
      }
    };

    fetchProfile();
  }, [token, userId]);

  const handleCompanyLogoUpload = async (file) => {
    try {
      setUploadMessage("Uploading company logo...");
      const result = await uploadCompanyLogo(token, file);
      
      if (result.success) {
        setUploadMessage("Company logo uploaded successfully!");
        
        // Refresh profile data to get the new logo
        const data = await getProfileData(token, userId);
        setProfileData(data);
        
        if (data?.employer?.companyLogoFileId) {
          setProfileImage(getProfilePictureUrl(data.employer.companyLogoFileId));
        }
        
        setShowLogoUpload(false);
        setTimeout(() => setUploadMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error uploading company logo:", error);
      setUploadMessage(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleOpenModal = () => {
    if (!profileData?.employer) return;
    setShowModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData?.employer) return;

    // Validate required fields
    if (!formData.companyName?.trim()) {
      alert("Company name is required");
      return;
    }
    if (!formData.location?.trim()) {
      alert("Location is required");
      return;
    }

    const updatedData = {
      employerId: profileData.employer.employerId,
      userId: profileData.userId,
      companyName: formData.companyName.trim(),
      companyDescription: formData.companyDescription?.trim() || "",
      location: formData.location.trim(),
      website: formData.website?.trim() || "",
    };

    console.log("Sending update:", updatedData);

    try {
      await updateEmployerProfile(
        token,
        profileData.employer.employerId,
        updatedData
      );
      alert("Profile updated successfully!");
      setShowModal(false);
      
      // Refresh the profile data instead of reloading the entire page
      const data = await getProfileData(token, userId);
      setProfileData(data);
      if (data.employer) {
        setFormData({
          companyName: data.employer.companyName || "",
          companyDescription: data.employer.companyDescription || "",
          location: data.employer.location || "",
          website: data.employer.website || "",
        });
      }
    } catch (error) {
      console.error("Error updating employer profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  if (!profileData) {
    return (
      <div className="background">
        <EmployerHeader />
        <div className="container my-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
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
        <div
          id="card-container"
          className="card shadow p-4 mx-auto"
          style={{ width: 900, borderRadius: 10, textAlign: "center" }}
        >
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

          {/* Company Logo Section */}
          <div className="text-center mb-4">
            <ImagePreview
              imageUrl={profileImage !== basic ? profileImage : null}
              alt="Company Logo"
              size="large"
              shape="square"
            />
            <div className="mt-3">
              {!showLogoUpload ? (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowLogoUpload(true)}
                >
                  {profileImage !== basic ? 'Change Logo' : 'Add Logo'}
                </button>
              ) : (
                <div className="mt-3">
                  <ProfilePictureUpload
                    currentImage={profileImage !== basic ? profileImage : null}
                    onUpload={handleCompanyLogoUpload}
                    userType="employer"
                    label="Company Logo"
                  />
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-muted"
                    onClick={() => setShowLogoUpload(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <h2>Company Info</h2>
          <p>Name: {profileData.employer.companyName || "Not provided"}</p>
          <p>
            Description:{" "}
            {profileData.employer.companyDescription || "Not provided"}
          </p>
          <p>Location: {profileData.employer.location || "Not provided"}</p>
          <p>Website: {profileData.employer.website || "Not provided"}</p>

          <button
            className="btn btn-primary rounded-pill"
            onClick={handleOpenModal}
          >
            Edit Profile
          </button>

          {showModal && (
            <Modal onClose={() => setShowModal(false)}>
              <form onSubmit={handleUpdateProfile}>
                <h2>Edit Profile</h2>

                <div className="mb-3">
                  <label htmlFor="companyName" className="form-label">
                    Company Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-control"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="companyDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="companyDescription"
                    className="form-control"
                    rows="3"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    maxLength={1000}
                  />
                  <small className="text-muted">
                    {formData.companyDescription?.length || 0}/1000 characters
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="website" className="form-label">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    className="form-control"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>

                <button type="submit" className="btn btn-primary rounded-pill">
                  Update Profile
                </button>
              </form>
            </Modal>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}