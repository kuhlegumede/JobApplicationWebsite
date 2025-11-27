import React, { useState, useEffect } from 'react';

const FaqForm = ({ faq, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        displayOrder: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (faq) {
            setFormData({
                question: faq.question || '',
                answer: faq.answer || '',
                category: faq.category || '',
                displayOrder: faq.displayOrder || 0
            });
        }
    }, [faq]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'displayOrder' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{faq ? 'Edit FAQ' : 'Create New FAQ'}</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="question" className="form-label">Question <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            id="question"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            placeholder="Enter the FAQ question"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="answer" className="form-label">Answer <span className="text-danger">*</span></label>
                        <textarea
                            className="form-control"
                            id="answer"
                            name="answer"
                            rows="5"
                            value={formData.answer}
                            onChange={handleChange}
                            placeholder="Enter the FAQ answer"
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="General">General</option>
                                    <option value="Job Seekers">Job Seekers</option>
                                    <option value="Employers">Employers</option>
                                    <option value="Account">Account</option>
                                    <option value="Applications">Applications</option>
                                    <option value="Technical">Technical</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label htmlFor="displayOrder" className="form-label">Display Order</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="displayOrder"
                                    name="displayOrder"
                                    value={formData.displayOrder}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                        {onCancel && (
                            <button 
                                type="button" 
                                onClick={onCancel} 
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (faq ? 'Update FAQ' : 'Create FAQ')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FaqForm;
