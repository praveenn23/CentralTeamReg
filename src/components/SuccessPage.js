import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessPage.css';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Registration Successful!</h1>
        <p>Your application has been submitted successfully.</p>
        <p>Our team will review your application and connect with you soon.</p>
        <button 
          className="home-button"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessPage; 