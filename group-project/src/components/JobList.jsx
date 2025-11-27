import { JobCard } from "./JobCard";
import { Modal } from "./Modal";
import { useState } from "react";
import { ApplicationModal } from "./ApplicationModal";
export function JobList({ jobs = [] }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  if (jobs.length === 0) {
    return <p>No jobs found.</p>;
  }

  const handleApplyClick = (job) => {
    console.log("Apply button clicked for job:", job);
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  return (
    <>
      {jobs.map((job) => (
        <JobCard
          key={job.jobPostId || job.id}
          title={job.title}
          name={job.employer?.companyName || job.companyName || job.name}
          requirements={job.requirements}
          salaryRange={job.salaryRange}
          location={job.location}
          postedDate={new Date(job.postedDate).toLocaleDateString()}
          deadLineDate={new Date(job.deadLineDate).toLocaleDateString()}
          companyLogoFileId={job.employer?.companyLogoFileId}
          onClick={() => setSelectedJob(job)}
        >
          <button
            className="btn btn-primary rounded-pill w-50"
            onClick={(e) => {
              e.stopPropagation();
              handleApplyClick(job);
            }}
          >
            Apply now
          </button>
        </JobCard>
      ))}
      {showApplicationModal && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
        />
      )}
    </>
  );
}
