import React from "react";

export function InterviewDetailsModal({ interview, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const generateGoogleCalendarLink = () => {
    const startDate = new Date(interview.scheduleDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const title = encodeURIComponent(`Interview: ${interview.jobApplication?.jobPost?.title || "Position"}`);
    const details = encodeURIComponent(`Interview for ${interview.jobApplication?.jobPost?.title || "Position"}\n\nMode: ${interview.interviewMode}\n\nNotes: ${interview.notes || "N/A"}`);
    const location = encodeURIComponent(interview.jobApplication?.jobPost?.location || "");

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${details}&location=${location}`;
  };

  const generateOutlookCalendarLink = () => {
    const startDate = new Date(interview.scheduleDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const title = encodeURIComponent(`Interview: ${interview.jobApplication?.jobPost?.title || "Position"}`);
    const body = encodeURIComponent(`Interview for ${interview.jobApplication?.jobPost?.title || "Position"}\n\nMode: ${interview.interviewMode}\n\nNotes: ${interview.notes || "N/A"}`);
    const location = encodeURIComponent(interview.jobApplication?.jobPost?.location || "");

    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${body}&location=${location}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`;
  };

  const downloadICalFile = () => {
    const startDate = new Date(interview.scheduleDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatICalDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
DTSTAMP:${formatICalDate(new Date())}
UID:interview-${interview.interviewId}@nextstep.com
SUMMARY:Interview: ${interview.jobApplication?.jobPost?.title || "Position"}
DESCRIPTION:Interview for ${interview.jobApplication?.jobPost?.title || "Position"}\\n\\nMode: ${interview.interviewMode}\\n\\nNotes: ${interview.notes || "N/A"}
LOCATION:${interview.jobApplication?.jobPost?.location || ""}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interview-${interview.interviewId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPast = new Date(interview.scheduleDate) < new Date();

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Interview Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {/* Job Information */}
            <div className="mb-4">
              <h6 className="text-muted mb-3">Job Information</h6>
              <h4>{interview.jobApplication?.jobPost?.title || "N/A"}</h4>
              <p className="text-muted mb-2">
                <i className="bi bi-building me-2"></i>
                {interview.jobApplication?.jobPost?.location || "Location not specified"}
              </p>
              {interview.jobApplication?.jobPost?.description && (
                <p className="mb-0">
                  <small>{interview.jobApplication?.jobPost?.description}</small>
                </p>
              )}
            </div>

            <hr />

            {/* Interview Schedule */}
            <div className="mb-4">
              <h6 className="text-muted mb-3">Interview Schedule</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar3 fs-4 me-3 text-primary"></i>
                    <div>
                      <small className="text-muted d-block">Date</small>
                      <strong>{formatDate(interview.scheduleDate)}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-clock fs-4 me-3 text-primary"></i>
                    <div>
                      <small className="text-muted d-block">Time</small>
                      <strong>{formatTime(interview.scheduleDate)}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-laptop fs-4 me-3 text-primary"></i>
                    <div>
                      <small className="text-muted d-block">Mode</small>
                      <strong>{interview.interviewMode}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle fs-4 me-3 text-primary"></i>
                    <div>
                      <small className="text-muted d-block">Status</small>
                      <strong className={isPast ? "text-secondary" : "text-success"}>
                        {isPast ? "Completed" : "Scheduled"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {interview.notes && (
              <>
                <hr />
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Notes</h6>
                  <div className="alert alert-info mb-0">
                    <i className="bi bi-sticky me-2"></i>
                    {interview.notes}
                  </div>
                </div>
              </>
            )}

            {/* Add to Calendar */}
            {!isPast && (
              <>
                <hr />
                <div>
                  <h6 className="text-muted mb-3">Add to Calendar</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <a
                      href={generateGoogleCalendarLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-google me-2"></i>
                      Google Calendar
                    </a>
                    <a
                      href={generateOutlookCalendarLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-microsoft me-2"></i>
                      Outlook
                    </a>
                    <button
                      className="btn btn-outline-primary"
                      onClick={downloadICalFile}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download (.ics)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
