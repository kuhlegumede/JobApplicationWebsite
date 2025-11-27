import { JobSeekerHeader } from "../../components/JobSeekerHeader";
import { JobList } from "../../components/JobList";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";
import { jobService } from "../../services/jobService";
export function JobSeekerHome() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [titleQuery, setTitleQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await jobService.getAllJobPosts();
        setJobs(data);
        setFilteredJobs(data); // show all initially
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }
    loadJobs();
  }, []);

  const handleSearch = () => {
    const results = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(titleQuery.toLowerCase()) &&
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
    );
    setFilteredJobs(results);
  };

  return (
    <>
      <div className="background">
        <JobSeekerHeader />

        <div className="container my-4">
          <div id="card-container" className="card shadow p-4 card-container">
            <div className="d-flex align-items-center border rounded overflow-hidden mb-4">
              <input
                type="text"
                className="form-control border-0 searchbar"
                placeholder="Job Title"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
              />

              <input
                type="text"
                className="form-control border-0 searchbar"
                placeholder="City/Suburb"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                Search
              </button>
            </div>

            <JobList jobs={filteredJobs} />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
