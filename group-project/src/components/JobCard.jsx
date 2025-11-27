import { StatusBadge } from "./StatusBadge";
import ImagePreview from "./ImagePreview";
import { getProfilePictureUrl } from "../services/fileService";

export function JobCard({
  title,
  name,
  requirements,
  salaryRange,
  location,
  postedDate,
  deadLineDate,
  status,
  companyLogoFileId,
  onClick,
  children,
}) {
  const companyLogoUrl = companyLogoFileId ? getProfilePictureUrl(companyLogoFileId) : null;

  return (
    <div
      className="border rounded p-3 mb-3 d-flex gap-3"
      onClick={onClick}
      style={{ alignItems: "flex-start", cursor: "pointer" }}
    >
      {/* Company Logo */}
      <div className="flex-shrink-0">
        <ImagePreview
          imageUrl={companyLogoUrl}
          alt={`${name} logo`}
          size="medium"
          shape="square"
        />
      </div>

      {/* Job Details */}
      <div style={{ flex: 1 }}>
        <h3>{title} {status && <StatusBadge status={status} />}</h3>
        <p>
          <strong>Company: </strong>
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

        {children}
      </div>
    </div>
  );
}
