import React from 'react';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
    const colorMap = {
        blue: 'primary',
        green: 'success',
        yellow: 'warning',
        red: 'danger',
        purple: 'info'
    };
    
    const bgColor = colorMap[color] || color;
    
    return (
        <div className={`card border-0 shadow-sm h-100`}>
            <div className={`card-body bg-${bgColor} text-white rounded`}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fs-3">{icon}</span>
                    <h6 className="card-subtitle text-white-50 text-uppercase small">{title}</h6>
                </div>
                <h2 className="card-title mb-0 fw-bold">{value}</h2>
                {trend && (
                    <div className="mt-2">
                        <small className="text-white-50">
                            <span className="me-1">{trend === 'up' ? '↑' : '↓'}</span>
                            {trendValue}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;