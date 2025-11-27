import React, { useState } from "react";

export function JobManagement() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      position: "Software Engineer",
      company: "TechNova",
      location: "Cape Town",
      salary: "R45,000",
      description:
        "Develop and maintain web applications using React and Node.js.",
      closingDate: "2025-11-10",
    },
    {
      id: 2,
      position: "UI/UX Designer",
      company: "DesignWorks",
      location: "Durban",
      salary: "R38,000",
      description:
        "Design intuitive user interfaces and improve user experience for clients.",
      closingDate: "2025-12-01",
    },
    {
      id: 3,
      position: "Data Analyst",
      company: "InsightHub",
      location: "Johannesburg",
      salary: "R42,000",
      description:
        "Analyze data trends and produce actionable reports for business teams.",
      closingDate: "2025-11-25",
    },
  ]);

  const handleRemove = (id) => {
    const updatedJobs = jobs.filter((job) => job.id !== id);
    setJobs(updatedJobs);
  };

  return (
    <div>
      <h2 className="mb-3">Job Management</h2>

      <table className="table table-striped shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Position</th>
            <th>Company</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Description</th>
            <th>Closing Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.position}</td>
              <td>{job.company}</td>
              <td>{job.location}</td>
              <td>{job.salary}</td>
              <td>{job.description}</td>
              <td>{job.closingDate}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemove(job.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {jobs.length === 0 && (
        <p className="text-center text-muted">No job postings available.</p>
      )}
    </div>
  );
}
