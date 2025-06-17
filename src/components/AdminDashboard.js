import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-options">
        <div className="option-card" onClick={() => navigate('/admin/manage-registrations')}>
          <h2>Manage Registrations</h2>
          <p>View and manage all registration applications</p>
        </div>
        <div className="option-card" onClick={() => navigate('/admin/evaluate')}>
          <h2>Evaluation</h2>
          <p>Evaluate and assess applications</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 