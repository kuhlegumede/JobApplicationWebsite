import { useState } from "react";
import { Modal } from "./Modal";
import { interviewService } from "../services/interviewService";

export function EditInterviewModal({ interview, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    scheduleDate: interview?.scheduleDate
      ? new Date(interview.scheduleDate).toISOString().slice(0, 16)
      : "",
    interviewMode: interview?.mode || interview?.interviewMode || "Online",
    notes: interview?.notes || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const scheduleDateTime = new Date(formData.scheduleDate).toISOString();

      const interviewData = {
        interviewId: interview.interviewId,
        jobApplicationId: interview.jobApplicationId,
        scheduleDate: scheduleDateTime,
        interviewMode: formData.interviewMode,
        notes: formData.notes || "",
      };

      await interviewService.updateInterview(
        interview.interviewId,
        interviewData
      );

      if (onSuccess) {
        onSuccess();
      }

      alert("Interview updated successfully!");
      onClose();
    } catch (err) {
      setError("Failed to update interview: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await interviewService.deleteInterview(interview.interviewId);

      if (onSuccess) {
        onSuccess();
      }

      alert("Interview cancelled successfully!");
      onClose();
    } catch (err) {
      setError("Failed to cancel interview: " + err.message);
      console.error(err);
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 16);
  };

  if (showDeleteConfirm) {
    return (
      <Modal onClose={onClose}>
        <h3 className="text-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Cancel Interview
        </h3>
        <p className="my-4">
          Are you sure you want to cancel this interview? This action cannot be
          undone.
        </p>
        <div className="alert alert-warning">
          <strong>Interview Details:</strong>
          <br />
          Date: {new Date(interview.scheduleDate).toLocaleString()}
          <br />
          Mode: {interview.mode || interview.interviewMode}
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={loading}
          >
            Go Back
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Cancelling...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Yes, Cancel Interview
              </>
            )}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h3>Edit Interview</h3>

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
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            <i className="bi bi-trash me-2"></i>
            Cancel Interview
          </button>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
