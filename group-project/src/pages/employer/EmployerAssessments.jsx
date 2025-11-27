import { EmployerHeader } from "../../components/EmployerHeader";
import CreateAssessment from "../../components/CreateAssessments";
import AssessmentSubmissions from "../../components/AssessmentSubmissions";
import { Footer } from "../../components/Footer";
import { useState, useEffect } from "react";
import { assessmentService } from "../../services/assessmentService";

export function EmployerAssessments() {
  const [view, setView] = useState('list'); // 'list', 'create', 'submissions'
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const userFromStorage = JSON.parse(localStorage.getItem("user"));
  
  // Get employer ID from multiple possible locations
  const employerId = 
    userFromStorage?.roleData?.employerId ||  // New structure from updated login
    userFromStorage?.employer?.employerId ||  // Old structure
    userFromStorage?.employerId ||            // Direct property
    null;

  console.log(' EmployerAssessments - User from storage:', userFromStorage);
  console.log('EmployerAssessments - Employer ID:', employerId);

  const loadAssessments = async () => {
    try {
      console.log('Loading assessments for employer:', employerId);
      if (!employerId) {
        console.error('❌ No employer ID available');
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await assessmentService.getAssessmentsByEmployer(employerId);
      setAssessments(data);
    } catch (error) {
      console.error("❌ Error loading assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSuccess = () => {
    setView('list');
    loadAssessments();
  };

  const handleToggleActive = async (id) => {
    try {
      await assessmentService.toggleActive(id);
      loadAssessments();
    } catch (error) {
      console.error("Error toggling assessment:", error);
      alert("Failed to update assessment status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    try {
      await assessmentService.deleteAssessment(id);
      loadAssessments();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("Failed to delete assessment");
    }
  };

  const handleViewSubmissions = (assessment) => {
    setSelectedAssessment(assessment);
    setView('submissions');
  };

  const renderContent = () => {
    if (view === 'create') {
      return <CreateAssessment onSuccess={handleCreateSuccess} />;
    }

    if (view === 'submissions' && selectedAssessment) {
      return (
        <AssessmentSubmissions 
          assessment={selectedAssessment}
          onBack={() => {
            setView('list');
            setSelectedAssessment(null);
          }}
        />
      );
    }

    // List view
    return (
      <div className="row">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i
                  className="bi bi-clipboard-check"
                  style={{ fontSize: "4rem", opacity: 0.3 }}
                ></i>
                <h5 className="mt-3 text-muted">No assessments yet</h5>
                <p className="text-muted">
                  Create your first assessment to evaluate candidates
                </p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => setView('create')}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Create Assessment
                </button>
              </div>
            </div>
          </div>
        ) : (
          assessments.map((assessment) => (
            <div key={assessment.assessmentId} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{assessment.title}</h5>
                    <span
                      className={`badge ${
                        assessment.isActive ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {assessment.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {assessment.description && (
                    <p className="card-text text-muted">
                      {assessment.description}
                    </p>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      <i className="bi bi-question-circle me-1"></i>
                      {assessment.questions?.length || 0} questions
                    </small>
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2 mb-2">
                    <button
                      className={`btn btn-sm flex-grow-1 ${
                        assessment.isActive ? "btn-warning" : "btn-success"
                      }`}
                      onClick={() =>
                        handleToggleActive(assessment.assessmentId)
                      }
                    >
                      <i
                        className={`bi ${
                          assessment.isActive ? "bi-pause" : "bi-play"
                        } me-1`}
                      ></i>
                      {assessment.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(assessment.assessmentId)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={() => handleViewSubmissions(assessment)}
                  >
                    <i className="bi bi-eye me-1"></i>
                    View Submissions
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <>
      <EmployerHeader />
      <div className="container my-4">
        {view !== 'submissions' && (
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              {view === 'create' ? 'Create New Assessment' : 'My Assessments'}
            </h2>
            {view === 'list' && (
              <button
                className="btn btn-primary"
                onClick={() => setView('create')}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Create New Assessment
              </button>
            )}
            {view === 'create' && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setView('list')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to My Assessments
              </button>
            )}
          </div>
        )}

        {renderContent()}
      </div>
      <Footer />
    </>
  );
}
