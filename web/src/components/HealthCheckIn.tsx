import React, { useState } from 'react';
import { Heart, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/components/HealthCheckIn.css';

interface HealthMetric {
  id: string;
  label: string;
  status: 'good' | 'fair' | 'poor';
  icon: React.ReactNode;
}

export const HealthCheckIn: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    { id: 'mood', label: 'How are you feeling?', status: 'good', icon: '😊' },
    { id: 'energy', label: 'Energy level', status: 'good', icon: '⚡' },
    { id: 'pain', label: 'Pain level', status: 'good', icon: '💊' },
    { id: 'sleep', label: 'Sleep quality', status: 'fair', icon: '😴' },
  ]);

  const [submitted, setSubmitted] = useState(false);

  const updateMetric = (id: string, status: HealthMetric['status']) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, status } : m));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (submitted) {
    return (
      <div className="health-checkin-success">
        <CheckCircle size={56} />
        <h3>Check-in recorded</h3>
        <p>Your health metrics have been saved</p>
      </div>
    );
  }

  return (
    <div className="health-checkin">
      <div className="health-header">
        <Heart size={32} />
        <h2>Daily Health Check-in</h2>
      </div>

      <div className="health-metrics">
        {metrics.map(metric => (
          <div key={metric.id} className="health-metric">
            <div className="metric-label">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-name">{metric.label}</span>
            </div>
            <div className="metric-status">
              {(['good', 'fair', 'poor'] as const).map(status => (
                <button
                  key={status}
                  className={`status-btn status-${status} ${metric.status === status ? 'active' : ''}`}
                  onClick={() => updateMetric(metric.id, status)}
                  aria-label={`${status} status`}
                >
                  {status === 'good' && '✓'}
                  {status === 'fair' && '–'}
                  {status === 'poor' && '✕'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={handleSubmit}>
        Save Check-in
      </button>

      <div className="health-info">
        <AlertCircle size={20} />
        <p>Your health data is private and only shared with your emergency contacts</p>
      </div>
    </div>
  );
};
