// Job Application Service
// Handles job application CRUD operations

const API_URL = "https://localhost:7087/api";

export const applicationService = {
  async applyForJob(jobPostId, applicationData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/JobApplication`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...applicationData, jobPostId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to apply for job");
    }
    return await response.json();
  },

  async getMyApplications(jobSeekerId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/JobApplication/jobseeker/${jobSeekerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch applications");
    return await response.json();
  },

  async getApplicationsByJobPost(jobPostId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/JobApplication/jobpost/${jobPostId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching applications by job post:", error);
      throw error;
    }
  },

  async getApplicationById(applicationId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/JobApplication/${applicationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch application");
    return await response.json();
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/JobApplication/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationStatus: status,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update application status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  },

  async getApplicantDetails(applicationId) {
    try {
      const application = await this.getApplicationById(applicationId);
      
      // The application already includes jobSeeker and user details
      return {
        applicationId: application.jobApplicationId,
        jobSeekerId: application.jobSeekerId,
        status: application.applicationStatus,
        dateApplied: application.dateApplied,
        lastUpdated: application.lastUpdated,
        resume: application.resume,
        coverLetter: application.coverLetter,
        jobSeeker: application.jobSeeker,
        interview: application.interviewSchedule,
      };
    } catch (error) {
      console.error("Error fetching applicant details:", error);
      throw error;
    }
  },

  async deleteApplication(applicationId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/JobApplication/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete application: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  },
};
