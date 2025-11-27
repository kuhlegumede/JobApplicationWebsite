import { useState, useEffect } from "react";
import { assessmentService } from "../services/assessmentService";

export default function AssessmentList({ onSelect }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assessmentService.getMyAssignedAssessments();
      
      // Sort by status priority: Pending first, then InProgress, then Completed/Reviewed
      const statusPriority = { 'Pending': 1, 'InProgress': 2, 'Completed': 3, 'Reviewed': 4 };
      const sorted = data.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 5;
        const priorityB = statusPriority[b.status] || 5;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(b.assignedAt) - new Date(a.assignedAt);
      });
      
      setAssignments(sorted);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { color: 'warning', icon: 'clock', text: 'Pending' },
      'InProgress': { color: 'info', icon: 'play-circle', text: 'In Progress' },
      'Completed': { color: 'success', icon: 'check-circle', text: 'Completed' },
      'Reviewed': { color: 'primary', icon: 'star', text: 'Reviewed' }
    };
    const badge = badges[status] || { color: 'secondary', icon: 'question-circle', text: status };
    
    return (
      <span className={`badge bg-${badge.color}`}>
        <i className={`bi bi-${badge.icon} me-1`}></i>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error loading assessments: {error}
        </div>
        <button className="btn btn-primary" onClick={loadAssignments}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="h4 mb-4">
        <i className="bi bi-clipboard-check me-2"></i>
        My Assigned Assessments
      </h2>
      
      {assignments.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-clipboard-check" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
          <h5 className="mt-3 text-muted">No assessments assigned yet</h5>
          <p className="text-muted">Check back later for new assessments from employers</p>
        </div>
      ) : (
        <div className="list-group">
          {assignments.map((assignment) => {
            const isCompleted = assignment.status === 'Completed' || assignment.status === 'Reviewed';
            
            return (
              <button
                key={assignment.assignmentId}
                type="button"
                className={`list-group-item list-group-item-action ${isCompleted ? 'list-group-item-light' : ''}`}
                onClick={() => !isCompleted && onSelect(assignment)}
                disabled={isCompleted}
                style={{ cursor: isCompleted ? 'default' : 'pointer' }}
              >
                <div className="d-flex w-100 justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h5 className="mb-1">
                      {assignment.assessmentTitle}
                      {assignment.status === 'Pending' && (
                        <span className="badge bg-danger ms-2">New</span>
                      )}
                    </h5>
                    {assignment.assessmentDescription && (
                      <p className="mb-1 text-muted small">{assignment.assessmentDescription}</p>
                    )}
                    <div className="d-flex gap-3 mt-2 small">
                      <span className="text-muted">
                        <i className="bi bi-building me-1"></i>
                        {assignment.employerName}
                      </span>
                      <span className="text-muted">
                        <i className="bi bi-question-circle me-1"></i>
                        {assignment.questions?.length || 0} questions
                      </span>
                      <span className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                      </span>
                      {assignment.completedAt && (
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Completed: {new Date(assignment.completedAt).toLocaleDateString()}
                        </span>
                      )}
                      {assignment.score !== null && assignment.score !== undefined && (
                        <span className="text-primary fw-bold">
                          <i className="bi bi-star-fill me-1"></i>
                          Score: {assignment.score}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ms-3">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
                {isCompleted && (
                  <div className="mt-2">
                    <small className="text-muted fst-italic">
                      <i className="bi bi-info-circle me-1"></i>
                      This assessment has been completed
                    </small>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
