import { JobSeekerHeader } from "../../components/JobSeekerHeader";
import { ApplicationList } from "../../components/ApplicationList";
import { Footer } from "../../components/Footer";
import { useEffect, useState } from "react";
import { applicationService } from "../../services/applicationService";
import { getProfileData } from "../../services/profileService";

export function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        
        if (!token || !storedUser) throw new Error("User not authenticated");

        // Try to get jobSeekerId from stored user first
        let jobSeekerId = storedUser?.jobSeeker?.jobSeekerId;
        
        // If not found, fetch full profile
        if (!jobSeekerId) {
          const userId = storedUser?.userId;
          if (!userId) throw new Error("User ID not found");
          const profileData = await getProfileData(token, userId);
          jobSeekerId = profileData?.jobSeeker?.jobSeekerId;
        }
        
        if (!jobSeekerId) throw new Error("Job seeker profile not found");

        const data = await applicationService.getMyApplications(jobSeekerId);
        setApplications(data);
      } catch (err) {
        setError(err.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  return (
    <>
      <div className="background">
        <JobSeekerHeader />
        <div className="container my-4">
          <div id="card-container" className="card shadow p-4 card-container">
            <h2>My Applications</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <ApplicationList jobs={applications} />
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
