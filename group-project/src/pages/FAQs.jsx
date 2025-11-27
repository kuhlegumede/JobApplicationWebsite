import { AuthHeader } from "../components/AuthHeader";
import { useNavigate } from "react-router-dom";
import { FAQItem } from "../components/FAQItem";

export function FAQs() {
  const navigate = useNavigate();
  const faqs = [
    {
      id: 1,
      question: "What is NextStep?",
      answer:
        "NextStep is a modern platform designed to help individuals and organisations achieve their personal, educational, and professional goals. Whether you are a student, job seeker, or business owner, NextStep provides tools and resources to guide you forward.",
    },
    {
      id: 2,
      question: "Who can use NextStep?",
      answer:
        "Anyone! NextStep is built for students, professionals, small businesses, and institutions that want structured support in planning, tracking, and achieving milestones.",
    },
    {
      id: 3,
      question: "Is NextStep free to use?",
      answer:
        "We offer both free and premium plans. Free gives access to essential tools; premium unlocks advanced features like analytics, personalised recommendations, and additional support.",
    },
    {
      id: 4,
      question: "How do I create an account?",
      answer:
        "Click on 'Create Account' on the home page, fill in your details, and verify your email. Once verified, you can log in and start using NextStep.",
    },
    {
      id: 5,
      question: "I forgot my password. What should I do?",
      answer:
        "Go to the 'Forgot Password' link on the login page, enter your registered email, and follow the instructions to reset your password.",
    },
    {
      id: 6,
      question: "Can I use NextStep on mobile devices?",
      answer:
        "Yes! NextStep is fully responsive and can be accessed from smartphones, tablets, and desktops using any modern browser.",
    },
    {
      id: 7,
      question: "How do I contact support?",
      answer:
        "You can reach out to our support team via email at help@nextstep.co.za or call us at +27 71 686 4997. We typically respond within 24 hours.",
    },
    {
      id: 8,
      question: "Can employers post jobs on NextStep?",
      answer:
        "Yes! Employers can create accounts, post job listings, and manage applications directly through the platform.",
    },
    {
      id: 9,
      question: "How is my personal information protected?",
      answer:
        "NextStep takes privacy seriously. All personal data is encrypted and securely stored. We comply with relevant data protection regulations.",
    },
    {
      id: 10,
      question: "Are there tutorials or guides?",
      answer:
        "Yes, NextStep provides guides, tutorials, and FAQs to help you navigate the platform efficiently and make the most of the tools available.",
    },
    {
      id: 11,
      question: "Can I track my progress on NextStep?",
      answer:
        "Absolutely! NextStep provides tools to track your learning, applications, and career milestones so you can monitor your growth over time.",
    },
    {
      id: 12,
      question: "Does NextStep offer notifications?",
      answer:
        "Yes! Users receive notifications for new job postings, upcoming deadlines, assessment results, and important platform updates.",
    },
    {
      id: 13,
      question: "Can multiple users share the same account?",
      answer:
        "Each account is intended for a single user. Sharing accounts is not recommended as it may affect your personalised recommendations and security.",
    },
    {
      id: 14,
      question: "Are there assessments available?",
      answer:
        "Yes, NextStep provides various assessments for job readiness, skill evaluation, and career planning to help users understand their strengths and areas for improvement.",
    },
    {
      id: 15,
      question: "How do I update my profile information?",
      answer:
        "Navigate to your profile page, click 'Edit,' update the necessary details, and save the changes. Your profile information will be immediately updated.",
    },
    {
      id: 16,
      question: "Can I delete my account?",
      answer:
        "Yes, if you decide to leave NextStep, you can delete your account from the settings page. Please note that this action is permanent.",
    },
    {
      id: 17,
      question: "Does NextStep integrate with other platforms?",
      answer:
        "Yes, NextStep can integrate with select job boards, email services, and learning platforms to streamline your workflow.",
    },
    {
      id: 18,
      question: "Is there customer support for businesses?",
      answer:
        "Yes, businesses and institutions have dedicated support channels to assist with onboarding, account management, and troubleshooting.",
    },
    {
      id: 19,
      question: "Can I customize my dashboard?",
      answer:
        "NextStep allows users to customize their dashboard to show relevant tools, upcoming tasks, notifications, and favourite resources.",
    },
    {
      id: 20,
      question: "How often is new content added?",
      answer:
        "NextStep regularly updates its platform with new resources, guides, assessments, and job opportunities to keep the content relevant and useful.",
    },
  ];
  
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <AuthHeader />
      
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
                    Frequently Asked Questions
                  </h1>
                  <p className="text-muted lead">
                    Find answers to common questions about NextStep and how to make the most of our platform.
                  </p>
                </div>

                {/* FAQ Accordion */}
                <div className="accordion accordion-flush" id="factsAccordion">
                  {faqs.map((FAQ, index) => (
                    <FAQItem
                      key={FAQ.id}
                      id={FAQ.id}
                      question={FAQ.question}
                      answer={FAQ.answer}
                      defaultOpen={index === 0}
                    />
                  ))}
                </div>

                {/* Help Section */}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
