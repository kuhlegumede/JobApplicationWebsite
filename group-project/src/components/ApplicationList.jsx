import { useState } from "react";
import { JobCard } from "./JobCard.jsx";

export function ApplicationList({ jobs = [] }) {
  const [_selectedJob, setSelectedJob] = useState(null);

  if (jobs.length === 0) {
    return <p>No applications found.</p>;
  }

  return (
    <>
      {jobs.map((application) => (
        <JobCard
          companyLogo={application.jobPost?.companyLogo}
          key={application.jobApplicationId}
          title={application.jobPost?.title}
          name={application.jobPost?.employer?.companyName}
          description={application.jobPost?.description}
          requirements={application.jobPost?.requirements}
          salaryRange={application.jobPost?.salaryRange}
          location={application.jobPost?.location}
          postedDate={new Date(application.jobPost?.postedDate).toLocaleDateString()}
          deadLineDate={new Date(application.jobPost?.deadLineDate).toLocaleDateString()}
          status={application.applicationStatus}
          showStatus={true}
          onClick={() => setSelectedJob(application)}
        />
      ))}
    </>
  );
}
