import React, { useState, useEffect } from "react";
import { assessmentService } from "../services/assessmentService";

function CreateAssessment({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [questionType, setQuestionType] = useState("Text");
  const [mcOptions, setMcOptions] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [selectedJobSeekers, setSelectedJobSeekers] = useState([]);
  const [loadingJobSeekers, setLoadingJobSeekers] = useState(false);

  useEffect(() => {
    fetchJobSeekers();
  }, []);

  const fetchJobSeekers = async () => {
    try {
      setLoadingJobSeekers(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7087/api/JobSeeker', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobSeekers(data);
      }
    } catch (err) {
      console.error('Error fetching job seekers:', err);
    } finally {
      setLoadingJobSeekers(false);
    }
  };

  const toggleJobSeeker = (jobSeekerId) => {
    setSelectedJobSeekers(prev => 
      prev.includes(jobSeekerId)
        ? prev.filter(id => id !== jobSeekerId)
        : [...prev, jobSeekerId]
    );
  };

  const handleAddMcOption = () => {
    setMcOptions([...mcOptions, ""]);
  };

  const handleRemoveMcOption = (index) => {
    if (mcOptions.length > 1) {
      setMcOptions(mcOptions.filter((_, i) => i !== index));
    }
  };

  const handleMcOptionChange = (index, value) => {
    const newOptions = [...mcOptions];
    newOptions[index] = value;
    setMcOptions(newOptions);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() === "") return;
    
    // Validate MultipleChoice questions have options
    if (questionType === "MultipleChoice") {
      const validOptions = mcOptions.filter(opt => opt.trim() !== "");
      if (validOptions.length === 0) {
        setError("Multiple choice questions must have at least one option");
        return;
      }
    }
    
    const question = {
      questionText: newQuestion,
      orderIndex: questions.length,
      type: questionType,
      options: questionType === "MultipleChoice" 
        ? mcOptions.filter(opt => opt.trim() !== "")
        : null,
    };
    
    setQuestions([...questions, question]);
    setNewQuestion("");
    setQuestionType("Text");
    setMcOptions([""]);
    setError(null);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveAssessment = async () => {
    if (!title.trim()) {
      setError("Please enter an assessment title");
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const assessmentData = {
        title: title.trim(),
        description: description.trim() || null,
        questions: questions.map((q, index) => ({
          ...q,
          orderIndex: index,
        })),
        jobSeekerIds: selectedJobSeekers.length > 0 ? selectedJobSeekers : null,
      };

      await assessmentService.createAssessment(assessmentData);
      alert("Assessment created successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setQuestions([]);
      setNewQuestion("");
      setSelectedJobSeekers([]);
      
      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error creating assessment:", err);
      setError(err.message || "Failed to create assessment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow p-4">
        <h2 className="mb-4">Create New Assessment</h2>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Assessment Title *</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Technical Skills Assessment"
            disabled={saving}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the assessment..."
            disabled={saving}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Assign to Job Seekers (Optional)</label>
          {loadingJobSeekers ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading job seekers...</span>
            </div>
          ) : jobSeekers.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No job seekers available to assign
            </div>
          ) : (
            <div className="card p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {jobSeekers.map(js => (
                <div key={js.jobSeekerId} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`js-${js.jobSeekerId}`}
                    checked={selectedJobSeekers.includes(js.jobSeekerId)}
                    onChange={() => toggleJobSeeker(js.jobSeekerId)}
                    disabled={saving}
                  />
                  <label className="form-check-label" htmlFor={`js-${js.jobSeekerId}`}>
                    {js.user?.firstName} {js.user?.lastName} ({js.user?.email})
                  </label>
                </div>
              ))}
            </div>
          )}
          {selectedJobSeekers.length > 0 && (
            <small className="text-muted mt-1 d-block">
              <i className="bi bi-check-circle me-1"></i>
              {selectedJobSeekers.length} job seeker(s) selected
            </small>
          )}
        </div>

        <h4 className="mb-3">Questions</h4>

        <div className="card bg-light p-3 mb-3">
          <div className="row g-2 mb-2">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question here..."
                disabled={saving}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddQuestion();
                  }
                }}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={questionType}
                onChange={(e) => {
                  setQuestionType(e.target.value);
                  if (e.target.value !== "MultipleChoice") {
                    setMcOptions([""]);
                  }
                }}
                disabled={saving}
              >
                <option value="Text">Text</option>
                <option value="MultipleChoice">Multiple Choice</option>
                <option value="YesNo">Yes/No</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={handleAddQuestion}
                disabled={saving}
              >
                <i className="bi bi-plus-lg"></i> Add
              </button>
            </div>
          </div>

          {questionType === "MultipleChoice" && (
            <div className="mt-3">
              <label className="form-label fw-bold">Answer Options:</label>
              {mcOptions.map((option, index) => (
                <div key={index} className="input-group mb-2">
                  <span className="input-group-text">{index + 1}.</span>
                  <input
                    type="text"
                    className="form-control"
                    value={option}
                    onChange={(e) => handleMcOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={saving}
                  />
                  {mcOptions.length > 1 && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveMcOption(index)}
                      disabled={saving}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleAddMcOption}
                disabled={saving}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Add Option
              </button>
            </div>
          )}
        </div>

        <div className="list-group mb-4">
          {questions.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-question-circle" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
              <p className="mt-2">No questions added yet</p>
            </div>
          ) : (
            questions.map((q, index) => (
              <div key={index} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div>
                      <strong>Q{index + 1}:</strong> {q.questionText}
                      <span className="badge bg-secondary ms-2">{q.type}</span>
                    </div>
                    {q.type === "MultipleChoice" && q.options && q.options.length > 0 && (
                      <div className="mt-2 ms-3">
                        <small className="text-muted d-block mb-1">Options:</small>
                        <ul className="mb-0">
                          {q.options.map((opt, optIndex) => (
                            <li key={optIndex}><small>{opt}</small></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={saving}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleSaveAssessment}
            disabled={saving || !title.trim() || questions.length === 0}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Save Assessment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAssessment;
