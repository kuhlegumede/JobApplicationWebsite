import { useState } from "react";
import { Modal } from "./Modal";
import { interviewService } from "../services/interviewService";

export function ScheduleInterviewModal({ applicant, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    scheduleDate: "",
    interviewMode: "Online",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Combine date and time for the API
      const scheduleDateTime = new Date(formData.scheduleDate).toISOString();

      const interviewData = {
        jobApplicationId: applicant.jobApplicationId,
        scheduleDate: scheduleDateTime,
        interviewMode: formData.interviewMode,
        notes: formData.notes || "",
      };

      await interviewService.createInterview(interviewData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      alert("Interview scheduled successfully!");
      onClose();
    } catch (err) {
      setError("Failed to schedule interview: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 16);
  };

  return (
    <Modal onClose={onClose}>
      <h3>Schedule Interview</h3>
      
      <div className="mb-3 p-3 bg-light rounded">
        <strong>Applicant:</strong>{" "}
        {applicant.jobSeeker?.user?.firstName}{" "}
        {applicant.jobSeeker?.user?.lastName}
        <br />
        <strong>Email:</strong> {applicant.jobSeeker?.user?.email}
        <br />
        <strong>Phone:</strong> {applicant.jobSeeker?.phoneNumber}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="scheduleDate" className="form-label">
            Date & Time <span className="text-danger">*</span>
          </label>
          <input
            type="datetime-local"
            className="form-control"
            id="scheduleDate"
            name="scheduleDate"
            value={formData.scheduleDate}
            onChange={handleInputChange}
            min={getMinDate()}
            required
          />
          <small className="form-text text-muted">
            Select the interview date and time
          </small>
        </div>

        <div className="mb-3">
          <label htmlFor="interviewMode" className="form-label">
            Interview Mode <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            id="interviewMode"
            name="interviewMode"
            value={formData.interviewMode}
            onChange={handleInputChange}
            required
          >
            <option value="Online">Online/Virtual</option>
            <option value="InPerson">In-Person</option>
            <option value="Phone">Phone Call</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="notes" className="form-label">
            Notes / Meeting Link
          </label>
          <textarea
            className="form-control"
            id="notes"
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleInputChange}
            maxLength="1000"
            placeholder="Enter meeting link, location details, or additional notes..."
          />
          <small className="form-text text-muted">
            {formData.interviewMode === "Online"
              ? "Include the meeting link (Zoom, Teams, Google Meet, etc.)"
              : formData.interviewMode === "InPerson"
              ? "Include the office address and any parking/entry instructions"
              : "Include any specific phone number or call instructions"}
          </small>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Scheduling...
              </>
            ) : (
              <>
                <i className="bi bi-calendar-check me-2"></i>
                Schedule Interview
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
