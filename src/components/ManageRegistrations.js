import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageRegistrations.css';

const ManageRegistrations = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      setError('Error loading registrations. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistration = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const handleUpdateStatus = async (registrationId, newStatus) => {
    if (!registrationId) {
      setError('Invalid registration ID');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/registrations/${registrationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the local state
      setRegistrations(registrations.map(reg => 
        reg._id === registrationId ? { ...reg, status: newStatus } : reg
      ));
    } catch (error) {
      setError('Error updating status. Please try again.');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading registrations...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="manage-registrations">
      <h1>Manage Registrations</h1>
      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration._id}>
                <td>{registration.uid}</td>
                <td>{registration.fullName}</td>
                <td>{registration.email}</td>
                <td>{registration.department}</td>
                <td>
                  <select
                    value={registration.status}
                    onChange={(e) => handleUpdateStatus(registration._id, e.target.value)}
                    className={`status-select ${registration.status.toLowerCase()}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{new Date(registration.submittedAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="action-button view"
                    onClick={() => handleViewRegistration(registration)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedRegistration && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Registration Details</h2>
            <div className="registration-details">
              <p><strong>Name:</strong> {selectedRegistration.fullName}</p>
              <p><strong>UID:</strong> {selectedRegistration.uid}</p>
              <p><strong>Department:</strong> {selectedRegistration.department}</p>
              <p><strong>Email:</strong> {selectedRegistration.email}</p>
              <p><strong>Phone:</strong> {selectedRegistration.phoneNumber}</p>
              <p><strong>CGPA:</strong> {selectedRegistration.cgpa}</p>
              <div className="experience-section">
                <h3>Previous Experience</h3>
                <p><strong>Leadership Roles:</strong> {selectedRegistration.leadershipRoles}</p>
                <p><strong>Major Events:</strong> {selectedRegistration.majorEvents}</p>
                <p><strong>Team Strategy:</strong> {selectedRegistration.teamStrategy}</p>
                <p><strong>Multitasking Ability:</strong> {selectedRegistration.multitaskingAbility}</p>
              </div>
              {selectedRegistration.resume && (
                <a 
                  href={`http://localhost:5000/${selectedRegistration.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-link"
                >
                  View Resume
                </a>
              )}
            </div>
            <button 
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRegistrations; 