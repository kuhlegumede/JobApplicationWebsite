export function FAQItem({ id, question, answer, defaultOpen = false }) {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`heading${id}`}>
        <button
          className={`accordion-button ${!defaultOpen ? "collapsed" : ""}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse${id}`}
          aria-expanded={defaultOpen}
          aria-controls={`collapse${id}`}
        >
          {question}
        </button>
      </h2>
      <div
        id={`collapse${id}`}
        className={`accordion-collapse collapse ${defaultOpen ? "show" : ""}`}
        aria-labelledby={`heading${id}`}
        data-bs-parent="#factsAccordion"
      >
        <div className="accordion-body">{answer}</div>
      </div>
    </div>
  );
}
