import { JobSeekerHeader } from "../../components/JobSeekerHeader";
import { useNavigate } from "react-router-dom";
import { FAQItem } from "../../components/FAQItem";
import { useState, useEffect } from "react";
import faqService from "../../services/faqService";

export function JobSeekerFAQs() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await faqService.getFaqsByCategory("JobSeekers");
      setFaqs(response || []);
    } catch (err) {
      console.error("Error loading FAQs:", err);
      setError("Failed to load FAQs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <JobSeekerHeader />
      
      <div className="container py-4">
        <div className="mb-4">
          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4 p-md-5">
                {/* Header Section */}
                <div className="text-center mb-5">
                  <div className="mb-3">
                    <i className="bi bi-question-circle text-primary" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h1 className="display-5 fw-bold text-dark mb-3">
                    Job Seeker FAQs
                  </h1>
                  <p className="text-muted lead">
                    Find answers to common questions about finding jobs, submitting applications, and using NextStep as a job seeker.
                  </p>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Loading FAQs...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && faqs.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: "3rem" }}></i>
                    <h4 className="mt-3 text-muted">No FAQs Available</h4>
                    <p className="text-muted">
                      Check back later for frequently asked questions.
                    </p>
                  </div>
                )}

                {/* FAQ Accordion */}
                {!loading && !error && faqs.length > 0 && (
                  <div className="accordion accordion-flush" id="jobSeekerFaqAccordion">
                    {faqs.map((faq, index) => (
                      <FAQItem
                        key={faq.faqId}
                        id={`jobseeker-${faq.faqId}`}
                        question={faq.question}
                        answer={faq.answer}
                        defaultOpen={index === 0}
                      />
                    ))}
                  </div>
                )}

                {/* Help Section */}
                {!loading && !error && faqs.length > 0 && (
                  <div className="mt-5 pt-4 border-top">
                    <div className="text-center">
                      <h5 className="fw-bold mb-3">Still have questions?</h5>
                      <p className="text-muted mb-3">
                        Can't find the answer you're looking for? Please contact our support team.
                      </p>
                      <div className="d-flex flex-wrap justify-content-center gap-3">
                        <a
                          href="mailto:help@nextstep.co.za"
                          className="btn btn-outline-primary rounded-pill px-4"
                        >
                          <i className="bi bi-envelope me-2"></i>
                          Email Support
                        </a>
                        <a
                          href="tel:+27716864997"
                          className="btn btn-outline-secondary rounded-pill px-4"
                        >
                          <i className="bi bi-telephone me-2"></i>
                          Call Us
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
