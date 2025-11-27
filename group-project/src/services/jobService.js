import { getProfileData } from "./profileService";

const API_URL = "https://localhost:7087/api";

export const jobService = {
  async getEmployerJobs() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.userId)
      throw new Error("User not found in localStorage");

    const profile = await getProfileData(token, user.userId);
    const employerId = profile.employer?.employerId;
    if (!employerId) throw new Error("Employer ID not found");

    const response = await fetch(`${API_URL}/JobPost/employer/${employerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    return await response.json();
  },

  async createJob(jobData) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    // Get the user object stored during login
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.userId)
      throw new Error("User not found in localStorage");

    // Get full profile to retrieve employerId
    const profile = await getProfileData(token, user.userId);
    const employerId = profile.employer?.employerId; 
    if (!employerId) throw new Error("Employer ID not found");

    const response = await fetch(`${API_URL}/JobPost`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...jobData,
        employerId,
        status: "Open",
        postedDate: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create job: ${errorText}`);
    }

    return await response.json();
  },

  async deleteJobPost(jobPostId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/JobPost/${jobPostId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete job");
    }

    return true;
  },

  async getAllJobPosts() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/JobPost`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch job posts");
    return await response.json();
  },
  async updateJobPost(jobPostId, updatedData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/JobPost/${jobPostId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to update job");
    }

    return await response.json();
  },
};
