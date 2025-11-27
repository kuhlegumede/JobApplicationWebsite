// CV/Resume Service
// Handles CV file operations

const API_URL = "https://localhost:7087/api";

export const cvService = {

  async downloadCV(fileId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/FileUpload/cv/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CV");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error downloading CV:", error);
      throw error;
    }
  },

  async getCVUrl(fileId) {
    try {
      const blob = await this.downloadCV(fileId);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error getting CV URL:", error);
      throw error;
    }
  },

  async getCVInfo(fileId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/FileUpload/info/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CV info");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching CV info:", error);
      throw error;
    }
  },

  async viewCV(fileId) {
    return await this.downloadCV(fileId);
  },

  async validateCVAccess(fileId) {
    try {
      await this.getCVInfo(fileId);
      return true;
    } catch (error) {
      console.error("CV access denied:", error);
      return false;
    }
  },

  async getCVByJobSeeker(jobSeeker) {
    try {
      if (!jobSeeker?.resumeFileId) {
        return null;
      }

      return await this.getCVUrl(jobSeeker.resumeFileId);
    } catch (error) {
      console.error("Error getting CV by job seeker:", error);
      return null;
    }
  },

  async downloadAndSaveCV(fileId, filename = "resume.pdf") {
    try {
      const blob = await this.downloadCV(fileId);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading and saving CV:", error);
      throw error;
    }
  },
};
