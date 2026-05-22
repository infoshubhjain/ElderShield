import React, { useState } from 'react';
import { Users, Phone, MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import '../styles/components/CaregiverDashboard.css';

interface CaregiverContact {
  id: string;
  name: string;
  relationship: string;
  lastCheck: string;
  status: 'checked-in' | 'pending' | 'alert';
  phone: string;
}

export const CaregiverDashboard: React.FC = () => {
  const [contacts, setContacts] = useState<CaregiverContact[]>([
    {
      id: '1',
      name: 'Sarah',
      relationship: 'Daughter',
      lastCheck: '2 hours ago',
      status: 'checked-in',
      phone: '+1-555-0101',
    },
    {
      id: '2',
      name: 'John',
      relationship: 'Son',
      lastCheck: '4 days ago',
      status: 'pending',
      phone: '+1-555-0102',
    },
    {
      id: '3',
      name: 'Emma',
      relationship: 'Granddaughter',
      lastCheck: '1 day ago',
      status: 'checked-in',
      phone: '+1-555-0103',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'status-good';
      case 'pending': return 'status-pending';
      case 'alert': return 'status-alert';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in': return <CheckCircle size={24} />;
      case 'pending': return <Clock size={24} />;
      case 'alert': return <AlertCircle size={24} />;
      default: return null;
    }
  };

  return (
    <div className="caregiver-dashboard">
      <div className="dashboard-header">
        <Users size={36} />
        <h2>Emergency Contacts</h2>
      </div>

      <div className="contacts-grid">
        {contacts.map(contact => (
          <div key={contact.id} className={`contact-card ${getStatusColor(contact.status)}`}>
            <div className="contact-header">
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p className="relationship">{contact.relationship}</p>
              </div>
              <div className="status-indicator">
                {getStatusIcon(contact.status)}
              </div>
            </div>

            <div className="contact-status">
              <span className="last-check">
                Last check: {contact.lastCheck}
              </span>
              <span className={`status-badge ${contact.status}`}>
                {contact.status === 'checked-in' && 'Checked In'}
                {contact.status === 'pending' && 'Pending'}
                {contact.status === 'alert' && 'Alert'}
              </span>
            </div>

            <div className="contact-actions">
              <button
                className="contact-action-btn call-btn"
                aria-label={`Call ${contact.name}`}
              >
                <Phone size={20} />
                <span>Call</span>
              </button>
              <button
                className="contact-action-btn location-btn"
                aria-label={`Share location with ${contact.name}`}
              >
                <MapPin size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <AlertCircle size={20} />
        <p>Emergency contacts can receive check-in requests and location sharing with your permission</p>
      </div>
    </div>
  );
};
