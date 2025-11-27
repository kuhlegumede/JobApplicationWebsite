import { AdminHeader } from "../../components/AdminHeader";
import { Footer } from "../../components/Footer";
import { Modal } from "../../components/Modal";
import { AdminFAQItem } from "../../components/AdminFAQItem";
import { useState } from "react";

export function FAQSManagement() {
  const defaultFAQs = [
    {
      id: 1,
      question: "Q: What is NextStep?",
      answer:
        "A: NextStep is a modern platform designed to help individuals and organisations achieve their personal, educational, and professional goals. Whether you are a student, job seeker, or business owner, NextStep provides tools and resources to guide you forward.",
    },
    {
      id: 2,
      question: "Q: Who can use NextStep?",
      answer:
        "A: Anyone! NextStep is built for students, professionals, small businesses, and institutions that want structured support in planning, tracking, and achieving milestones.",
    },
    {
      id: 3,
      question: "Q: Is NextStep free to use?",
      answer:
        "A: We offer both free and premium plans. Free gives access to essential tools; premium unlocks advanced features like analytics, personalised recommendations, and additional support.",
    },
    {
      id: 4,
      question: "Q: How do I create an account?",
      answer:
        "A: Click on 'Create Account' on the home page, fill in your details, and verify your email. Once verified, you can log in and start using NextStep.",
    },
    {
      id: 5,
      question: "Q: I forgot my password. What should I do?",
      answer:
        "A: Go to the 'Forgot Password' link on the login page, enter your registered email, and follow the instructions to reset your password.",
    },
    {
      id: 6,
      question: "Q: Can I use NextStep on mobile devices?",
      answer:
        "A: Yes! NextStep is fully responsive and can be accessed from smartphones, tablets, and desktops using any modern browser.",
    },
    {
      id: 7,
      question: "Q: How do I contact support?",
      answer:
        "A: You can reach out to our support team via email at help@nextstep.co.za or call us at +27 71 686 4997. We typically respond within 24 hours.",
    },
    {
      id: 8,
      question: "Q: Can employers post jobs on NextStep?",
      answer:
        "A: Yes! Employers can create accounts, post job listings, and manage applications directly through the platform.",
    },
    {
      id: 9,
      question: "Q: How is my personal information protected?",
      answer:
        "A: NextStep takes privacy seriously. All personal data is encrypted and securely stored. We comply with relevant data protection regulations.",
    },
    {
      id: 10,
      question: "Q: Are there tutorials or guides?",
      answer:
        "A: Yes, NextStep provides guides, tutorials, and FAQs to help you navigate the platform efficiently and make the most of the tools available.",
    },
    {
      id: 11,
      question: "Q: Can I track my progress on NextStep?",
      answer:
        "A: Absolutely! NextStep provides tools to track your learning, applications, and career milestones so you can monitor your growth over time.",
    },
    {
      id: 12,
      question: "Q: Does NextStep offer notifications?",
      answer:
        "A: Yes! Users receive notifications for new job postings, upcoming deadlines, assessment results, and important platform updates.",
    },
    {
      id: 13,
      question: "Q: Can multiple users share the same account?",
      answer:
        "A: Each account is intended for a single user. Sharing accounts is not recommended as it may affect your personalised recommendations and security.",
    },
    {
      id: 14,
      question: "Q: Are there assessments available?",
      answer:
        "A: Yes, NextStep provides various assessments for job readiness, skill evaluation, and career planning to help users understand their strengths and areas for improvement.",
    },
    {
      id: 15,
      question: "Q: How do I update my profile information?",
      answer:
        "A: Navigate to your profile page, click 'Edit,' update the necessary details, and save the changes. Your profile information will be immediately updated.",
    },
    {
      id: 16,
      question: "Q: Can I delete my account?",
      answer:
        "A: Yes, if you decide to leave NextStep, you can delete your account from the settings page. Please note that this action is permanent.",
    },
    {
      id: 17,
      question: "Q: Does NextStep integrate with other platforms?",
      answer:
        "A: Yes, NextStep can integrate with select job boards, email services, and learning platforms to streamline your workflow.",
    },
    {
      id: 18,
      question: "Q: Is there customer support for businesses?",
      answer:
        "A: Yes, businesses and institutions have dedicated support channels to assist with onboarding, account management, and troubleshooting.",
    },
    {
      id: 19,
      question: "Q: Can I customize my dashboard?",
      answer:
        "A: NextStep allows users to customize their dashboard to show relevant tools, upcoming tasks, notifications, and favourite resources.",
    },
    {
      id: 20,
      question: "Q: How often is new content added?",
      answer:
        "A: NextStep regularly updates its platform with new resources, guides, assessments, and job opportunities to keep the content relevant and useful.",
    },
  ];
  const [FAQs, setFAQs] = useState(defaultFAQs);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // "edit" | "delete" | "add"
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  const openEdit = (faq) => {
    setSelectedFAQ(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setModalAction("edit");
    setShowModal(true);
  };

  const openDelete = (faq) => {
    setSelectedFAQ(faq);
    setModalAction("delete");
    setShowModal(true);
  };

  const openAdd = () => {
    setSelectedFAQ(null);
    setFormData({ question: "", answer: "" });
    setModalAction("add");
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((s) => ({ ...s, [id]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    const q = formData.question?.trim();
    const a = formData.answer?.trim();
    if (!q || !a) return alert("Please provide both question and answer.");

    if (modalAction === "edit" && selectedFAQ) {
      setFAQs((prev) =>
        prev.map((f) =>
          f.id === selectedFAQ.id ? { ...f, question: q, answer: a } : f
        )
      );
    } else if (modalAction === "add") {
      const newId = FAQs.length ? Math.max(...FAQs.map((f) => f.id)) + 1 : 1;
      setFAQs((prev) => [...prev, { id: newId, question: q, answer: a }]);
    }

    setShowModal(false);
    setModalAction(null);
    setSelectedFAQ(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedFAQ) return;
    setFAQs((prev) => prev.filter((f) => f.id !== selectedFAQ.id));
    setShowModal(false);
    setModalAction(null);
    setSelectedFAQ(null);
  };

  return (
    <>
      <div className="background">
        <AdminHeader />
        <div className="container my-4">
          <div className="row justify-content-center">
            <div id="card-container" className="card shadow p-4 card-container">
              <div className="accordion" id="factsAccordion">
                {FAQs.map((FAQ, index) => (
                  <AdminFAQItem
                    key={FAQ.id}
                    id={FAQ.id}
                    question={FAQ.question}
                    answer={FAQ.answer}
                    defaultOpen={index === 0}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </div>

              <div className="mt-3 d-flex justify-content-center">
                <button className="btn btn-primary" onClick={openAdd}>
                  Add new FAQ
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {showModal && modalAction !== "delete" && (
          <Modal onClose={() => setShowModal(false)}>
            <form onSubmit={handleSave}>
              <h2 className="mb-3">
                {modalAction === "edit" ? "Edit FAQ" : "Add FAQ"}
              </h2>
              <div className="mb-3">
                <label htmlFor="question" className="form-label">
                  Question
                </label>
                <textarea
                  id="question"
                  className="form-control"
                  rows={2}
                  value={formData.question}
                  onChange={handleFormChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="answer" className="form-label">
                  Answer
                </label>
                <textarea
                  id="answer"
                  className="form-control"
                  rows={4}
                  value={formData.answer}
                  onChange={handleFormChange}
                />
              </div>
              <div className="d-flex justify-content-center gap-2">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showModal && modalAction === "delete" && (
          <Modal onClose={() => setShowModal(false)}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this FAQ?</p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
