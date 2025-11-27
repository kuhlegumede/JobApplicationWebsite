import { useState, useEffect } from "react";
import { assessmentService } from "../services/assessmentService";

export default function AssessmentSubmissions({ assessment, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score, setScore] = useState('');
  const [savingScore, setSavingScore] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [assessment.assessmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assessmentService.getAssessmentSubmissions(assessment.assessmentId);
      setSubmissions(data);
    } catch (err) {
      console.error('Error loading submissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubmissions = () => {
    if (filter === 'All') return submissions;
    return submissions.filter(s => s.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': { color: 'warning', icon: 'clock' },
      'InProgress': { color: 'info', icon: 'play-circle' },
      'Completed': { color: 'success', icon: 'check-circle' },
      'Reviewed': { color: 'primary', icon: 'star' }
    };
    const badge = badges[status] || { color: 'secondary', icon: 'question-circle' };
    
    return (
      <span className={`badge bg-${badge.color}`}>
        <i className={`bi bi-${badge.icon} me-1`}></i>
        {status}
      </span>
    );
  };

  const getStatistics = () => {
    const total = submissions.length;
    const completed = submissions.filter(s => s.status === 'Completed' || s.status === 'Reviewed').length;
    const reviewed = submissions.filter(s => s.status === 'Reviewed').length;
    const avgScore = reviewed > 0 
      ? Math.round(submissions.filter(s => s.score !== null).reduce((sum, s) => sum + s.score, 0) / reviewed)
      : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, reviewed, avgScore, completionRate };
  };

  const handleViewResponses = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleAddScore = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || '');
    setShowScoreModal(true);
  };

  const handleSaveScore = async () => {
    if (!score || isNaN(score)) {
      alert('Please enter a valid score');
      return;
    }

    try {
      setSavingScore(true);
      await assessmentService.updateAssignmentScore(selectedSubmission.assignmentId, parseInt(score));
      alert('Score updated successfully!');
      setShowScoreModal(false);
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (err) {
      console.error('Error saving score:', err);
      alert('Failed to save score: ' + err.message);
    } finally {
      setSavingScore(false);
    }
  };

  const stats = getStatistics();
  const filteredSubmissions = getFilteredSubmissions();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="btn btn-link text-decoration-none mb-3">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Assessments
        </button>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error loading submissions: {error}
        </div>
        <button className="btn btn-primary" onClick={loadSubmissions}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <button onClick={onBack} className="btn btn-link text-decoration-none mb-3">
        <i className="bi bi-arrow-left me-2"></i>
        Back to Assessments
      </button>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title mb-3">
            <i className="bi bi-clipboard-data me-2"></i>
            Submissions for: {assessment.title}
          </h3>

          {/* Statistics */}
          <div className="row g-3 mb-4">
            <div className="col-md-3"><div className="card bg-primary text-white"><div className="card-body text-center"><h4 className="mb-0">{stats.total}</h4><small>Total Assigned</small></div></div></div>
            <div className="col-md-3"><div className="card bg-success text-white"><div className="card-body text-center"><h4 className="mb-0">{stats.completed}</h4><small>Completed</small></div></div></div>
            <div className="col-md-3"><div className="card bg-info text-white"><div className="card-body text-center"><h4 className="mb-0">{stats.completionRate}%</h4><small>Completion Rate</small></div></div></div>
            <div className="col-md-3"><div className="card bg-warning text-dark"><div className="card-body text-center"><h4 className="mb-0">{stats.avgScore}</h4><small>Average Score</small></div></div></div>
          </div>

          {/* Filter Buttons */}
          <div className="btn-group mb-3" role="group">
            {['All', 'Pending', 'InProgress', 'Completed', 'Reviewed'].map(status => (
              <button
                key={status}
                type="button"
                className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(status)}
              >
                {status} ({status === 'All' ? submissions.length : submissions.filter(s => s.status === status).length})
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>Job Seeker</th><th>Email</th><th>Status</th><th>Assigned</th><th>Completed</th><th>Score</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(submission => (
                  <tr key={submission.assignmentId}>
                    <td>{submission.jobSeekerName}</td>
                    <td>{submission.jobSeekerEmail}</td>
                    <td>{getStatusBadge(submission.status)}</td>
                    <td>{new Date(submission.assignedAt).toLocaleDateString()}</td>
                    <td>{submission.completedAt ? new Date(submission.completedAt).toLocaleDateString() : '-'}</td>
                    <td>{submission.score !== null ? <span className="badge bg-primary"><i className="bi bi-star-fill me-1"></i>{submission.score}</span> : '-'}</td>
                    <td>
                      {(submission.status === 'Completed' || submission.status === 'Reviewed') && (
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleViewResponses(submission)}><i className="bi bi-eye"></i></button>
                          <button className="btn btn-outline-success" onClick={() => handleAddScore(submission)}><i className="bi bi-star"></i></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Responses Modal */}
      {selectedSubmission && !showScoreModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-file-text me-2"></i> Responses from {selectedSubmission.jobSeekerName}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedSubmission(null)}></button>
              </div>

              <div className="modal-body">
                {selectedSubmission.responses?.length > 0 ? (
                  selectedSubmission.responses.map((response, index) => (
                    <div key={response.questionId} className="mb-4">
                      <h6 className="fw-bold">
                        Q{index + 1}: {response.questionText}
                        <span className="badge bg-secondary ms-2">{response.questionType}</span>
                      </h6>

                      {response.options?.length > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">Options: {response.options.join(', ')}</small>
                        </div>
                      )}

                      <div className="alert alert-light mb-0">
                        <strong>Answer:</strong> {response.answer || <em className="text-muted">No answer provided</em>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No responses provided</p>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>Close</button>
                <button className="btn btn-success" onClick={() => { setShowScoreModal(true); setScore(selectedSubmission.score?.toString() || ''); }}>
                  <i className="bi bi-star me-2"></i> Add/Update Score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-star me-2"></i> Add/Update Score</h5>
                <button type="button" className="btn-close" disabled={savingScore}
                  onClick={() => { setShowScoreModal(false); setSelectedSubmission(null); }}>
                </button>
              </div>

              <div className="modal-body">
                <p><strong>Job Seeker:</strong> {selectedSubmission.jobSeekerName}</p>
                <div className="mb-3">
                  <label className="form-label">Score</label>
                  <input type="number" className="form-control" value={score} min="0" max="100"
                    disabled={savingScore} onChange={(e) => setScore(e.target.value)} />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" disabled={savingScore}
                  onClick={() => { setShowScoreModal(false); setSelectedSubmission(null); }}>Cancel</button>

                <button className="btn btn-primary" disabled={savingScore || !score} onClick={handleSaveScore}>
                  {savingScore ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-lg me-2"></i>Save Score</>}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
