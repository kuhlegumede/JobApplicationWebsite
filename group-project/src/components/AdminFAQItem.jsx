export function AdminFAQItem({
  id,
  question,
  answer,
  defaultOpen = false,
  onEdit,
  onDelete,
}) {
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
        <div className="accordion-body">
          <div style={{ whiteSpace: "pre-wrap" }}>{answer}</div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit && onEdit({ id, question, answer })}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete && onDelete({ id, question, answer })}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
