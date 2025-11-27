import React from "react";

export function StatusBadge({ status }) {
  let color = "secondary";
  let text = status || "Unknown";
  switch (status) {
    case "Pending":
      color = "warning";
      text = "Pending";
      break;
    case "Reviewed":
      color = "info";
      text = "Reviewed";
      break;
    case "Interview":
      color = "primary";
      text = "Interview";
      break;
    case "Rejected":
      color = "danger";
      text = "Rejected";
      break;
    case "Approved":
      color = "success";
      text = "Approved";
      break;
    default:
      color = "secondary";
      text = status || "Unknown";
  }
  return (
    <span className={`badge bg-${color} ms-2`}>{text}</span>
  );
}
