// Interview Service
// Handles interview scheduling and management

const API_URL = "https://localhost:7087/api";

export const interviewService = {

  async createInterview(interviewData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/InterviewSchedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error(error.message || "An interview has already been scheduled for this applicant.");
        }
        
        throw new Error(error.message || "Failed to create interview");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating interview:", error);
      throw error;
    }
  },

  async getAllInterviews() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/InterviewSchedule`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching interviews:", error);
      throw error;
    }
  },

  async getInterviewsByJobSeeker(jobSeekerId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/jobseeker/${jobSeekerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching interviews for job seeker:", error);
      throw error;
    }
  },

  async getInterviewByApplication(applicationId) {
    try {
      const allInterviews = await this.getAllInterviews();
      
      return (
        allInterviews.find(
          (interview) => interview.jobApplicationId === applicationId
        ) || null
      );
    } catch (error) {
      console.error("Error fetching interview by application:", error);
      throw error;
    }
  },

  async getInterviewById(interviewId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/${interviewId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interview");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching interview by ID:", error);
      throw error;
    }
  },

  async updateInterview(interviewId, interviewData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/${interviewId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(interviewData),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update interview");
      }
    } catch (error) {
      console.error("Error updating interview:", error);
      throw error;
    }
  },

  async deleteInterview(interviewId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/InterviewSchedule/${interviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      throw error;
    }
  },

  async getUpcomingInterviews() {
    try {
      const allInterviews = await this.getAllInterviews();
      const now = new Date();

      return allInterviews
        .filter((interview) => new Date(interview.scheduleDate) >= now)
        .sort(
          (a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate)
        );
    } catch (error) {
      console.error("Error fetching upcoming interviews:", error);
      throw error;
    }
  },

  async getPastInterviews() {
    try {
      const allInterviews = await this.getAllInterviews();
      const now = new Date();

      return allInterviews
        .filter((interview) => new Date(interview.scheduleDate) < now)
        .sort(
          (a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate)
        );
    } catch (error) {
      console.error("Error fetching past interviews:", error);
      throw error;
    }
  },

  async getTodaysInterviews() {
    try {
      const allInterviews = await this.getAllInterviews();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return allInterviews.filter((interview) => {
        const interviewDate = new Date(interview.scheduleDate);
        return interviewDate >= today && interviewDate < tomorrow;
      });
    } catch (error) {
      console.error("Error fetching today's interviews:", error);
      throw error;
    }
  },
};
