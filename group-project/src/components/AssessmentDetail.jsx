import { useState, useEffect } from "react";
import { assessmentService } from "../services/assessmentService";

export default function AssessmentDetail({ assessment: assignment, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isCompleted = assignment.status === 'Completed' || assignment.status === 'Reviewed';
  const isReadOnly = isCompleted;

  useEffect(() => {
    // If assessment is in Pending status, mark it as InProgress
    const startAssessment = async () => {
      if (assignment.status === 'Pending') {
        try {
          await assessmentService.startAssessment(assignment.assignmentId);
          console.log('Assessment started');
        } catch (error) {
          console.error('Error starting assessment:', error);
        }
      }
    };

    startAssessment();

    // Load existing answers if completed
    if (assignment.submittedResponses) {
      setAnswers(assignment.submittedResponses);
    }
  }, [assignment]);

  const handleAnswerChange = (questionId, value) => {
    if (isReadOnly) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear validation error for this question
    setValidationErrors(prev => prev.filter(id => id !== questionId));
  };

  const validateAnswers = () => {
    if (!assignment.questions) return true;

    const unansweredQuestions = assignment.questions
      .filter(q => !answers[q.questionId] || answers[q.questionId].trim() === '')
      .map(q => q.questionId);

    setValidationErrors(unansweredQuestions);
    return unansweredQuestions.length === 0;
  };

  const handleSubmit = () => {
    if (!validateAnswers()) {
      setError('Please answer all questions before submitting');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setSubmitting(true);
    setError(null);

    try {
      await assessmentService.submitAssessment(assignment.assignmentId, answers);
      alert('Assessment submitted successfully!');
      onBack(); // Go back to list
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!assignment.questions || assignment.questions.length === 0) return 0;
    const answeredCount = assignment.questions.filter(q => 
      answers[q.questionId] && answers[q.questionId].trim() !== ''
    ).length;
    return Math.round((answeredCount / assignment.questions.length) * 100);
  };

  return (
    <div className="p-4">
      <button 
        onClick={onBack} 
        className="btn btn-link text-decoration-none mb-3"
        disabled={submitting}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Back to List
      </button>

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="h4 mb-1">{assignment.assessmentTitle}</h2>
              {assignment.assessmentDescription && (
                <p className="text-muted mb-2">{assignment.assessmentDescription}</p>
              )}
              <div className="d-flex gap-3 small">
                <span className="text-muted">
                  <i className="bi bi-building me-1"></i>
                  {assignment.employerName}
                </span>
                <span className="text-muted">
                  <i className="bi bi-calendar me-1"></i>
                  Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <span className={`badge bg-${
                assignment.status === 'Pending' ? 'warning' :
                assignment.status === 'InProgress' ? 'info' :
                assignment.status === 'Completed' ? 'success' : 'primary'
              }`}>
                {assignment.status}
              </span>
              {assignment.score !== null && assignment.score !== undefined && (
                <div className="mt-2">
                  <span className="badge bg-primary">
                    <i className="bi bi-star-fill me-1"></i>
                    Score: {assignment.score}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isCompleted && (
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">Progress</small>
                <small className="text-muted">{getProgressPercentage()}%</small>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${getProgressPercentage()}%` }}
                  aria-valuenow={getProgressPercentage()} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {isCompleted && (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              This assessment has been completed and submitted.
              {assignment.completedAt && (
                <span> Submitted on {new Date(assignment.completedAt).toLocaleString()}</span>
              )}
            </div>
          )}

          {!assignment.questions || assignment.questions.length === 0 ? (
            <div className="alert alert-warning">
              This assessment has no questions yet.
            </div>
          ) : (
            assignment.questions
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((question, index) => {
                const hasError = validationErrors.includes(question.questionId);
                
                return (
                  <div key={question.questionId} className={`mb-4 ${hasError ? 'border border-danger rounded p-3' : ''}`}>
                    <label className="form-label fw-bold">
                      Q{index + 1}: {question.questionText}
                      {!isReadOnly && <span className="text-danger ms-1">*</span>}
                      {hasError && (
                        <span className="text-danger ms-2 small">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          Required
                        </span>
                      )}
                    </label>

                    {question.type === "Text" && (
                      <textarea
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        rows="3"
                        value={answers[question.questionId] || ""}
                        onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                        placeholder={isReadOnly ? "No answer provided" : "Type your answer here..."}
                        disabled={isReadOnly}
                      />
                    )}

                    {question.type === "YesNo" && (
                      <div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`q${question.questionId}`}
                            id={`q${question.questionId}-yes`}
                            value="Yes"
                            checked={answers[question.questionId] === "Yes"}
                            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                            disabled={isReadOnly}
                          />
                          <label className="form-check-label" htmlFor={`q${question.questionId}-yes`}>
                            Yes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`q${question.questionId}`}
                            id={`q${question.questionId}-no`}
                            value="No"
                            checked={answers[question.questionId] === "No"}
                            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                            disabled={isReadOnly}
                          />
                          <label className="form-check-label" htmlFor={`q${question.questionId}-no`}>
                            No
                          </label>
                        </div>
                      </div>
                    )}

                    {question.type === "MultipleChoice" && question.options && (
                      <div>
                        {question.options.map((option, idx) => (
                          <div key={idx} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`q${question.questionId}`}
                              id={`q${question.questionId}-opt${idx}`}
                              value={option}
                              checked={answers[question.questionId] === option}
                              onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                              disabled={isReadOnly}
                            />
                            <label className="form-check-label" htmlFor={`q${question.questionId}-opt${idx}`}>
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>

        {assignment.questions && assignment.questions.length > 0 && !isCompleted && (
          <div className="card-footer">
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || getProgressPercentage() === 0}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Submit Assessment
                </>
              )}
            </button>
            <small className="text-muted ms-3">
              <i className="bi bi-info-circle me-1"></i>
              Make sure all questions are answered before submitting
            </small>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-question-circle me-2"></i>
                  Confirm Submission
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirmDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to submit this assessment?</p>
                <p className="text-muted mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  You won't be able to change your answers after submission.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmSubmit}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
