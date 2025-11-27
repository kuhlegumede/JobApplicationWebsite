import React from 'react';

const FaqList = ({ faqs, onEdit, onDelete, onTogglePublish }) => {
    const getCategoryBadge = (category) => {
        const badgeMap = {
            'General': 'bg-primary',
            'Job Seekers': 'bg-success',
            'Employers': 'bg-info',
            'Account': 'bg-warning text-dark',
            'Applications': 'bg-danger',
            'Technical': 'bg-secondary'
        };
        return <span className={`badge ${badgeMap[category] || 'bg-secondary'}`}>{category}</span>;
    };

    return (
        <div className="accordion" id="faqAccordion">
            {faqs.length === 0 ? (
                <div className="alert alert-info">
                    No FAQs available. Create your first FAQ to get started!
                </div>
            ) : (
                faqs.map((faq, index) => (
                    <div className="accordion-item" key={faq.faqId}>
                        <h2 className="accordion-header">
                            <button 
                                className="accordion-button collapsed" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target={`#faq-${faq.faqId}`}
                            >
                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-secondary">{index + 1}</span>
                                        <span>{faq.question}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        {getCategoryBadge(faq.category)}
                                        {faq.isPublished ? (
                                            <span className="badge bg-success">Published</span>
                                        ) : (
                                            <span className="badge bg-warning text-dark">Draft</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </h2>
                        <div 
                            id={`faq-${faq.faqId}`} 
                            className="accordion-collapse collapse" 
                            data-bs-parent="#faqAccordion"
                        >
                            <div className="accordion-body">
                                <p className="mb-3">{faq.answer}</p>
                                
                                <div className="d-flex gap-2 justify-content-end border-top pt-3">
                                    {onTogglePublish && (
                                        <button
                                            onClick={() => onTogglePublish(faq.faqId, faq.isPublished)}
                                            className={`btn btn-sm ${faq.isPublished ? 'btn-warning' : 'btn-success'}`}
                                        >
                                            <i className={`bi ${faq.isPublished ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
                                            {faq.isPublished ? 'Unpublish' : 'Publish'}
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(faq)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="bi bi-pencil me-1"></i>
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this FAQ?')) {
                                                    onDelete(faq.faqId);
                                                }
                                            }}
                                            className="btn btn-sm btn-danger"
                                        >
                                            <i className="bi bi-trash me-1"></i>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default FaqList;
