export function EmployerJobCard({
  title,
  name,
  description,
  requirements,
  salaryRange,
  location,
  postedDate,
  deadLineDate,
  status,
  onClick,
  children,
}) {
  return (
    <div className="border rounded p-3 mb-3" onClick={onClick}>
      <h3>{title}</h3>

      <p>
        <strong>Employer: </strong>
        {name}
      </p>

      <p>
        <strong>Requirements: </strong>
        {requirements}
      </p>

      <p>
        <strong>Salary Range: </strong>
        {salaryRange}
      </p>

      <p>
        <strong>Location: </strong>
        {location}
      </p>

      <p>
        <strong>Posted: </strong>
        {postedDate}
      </p>

      <p>
        <strong>Closing Date: </strong>
        {deadLineDate}
      </p>

      <p>
        <strong>Description: </strong>
        {description}
      </p>

      <p>
        <strong>Status: </strong>
        {status}
      </p>

      {children}
    </div>
  );
}
