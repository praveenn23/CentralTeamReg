import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import './App.css';
import SuccessPage from './components/SuccessPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ManageRegistrations from './components/ManageRegistrations';
import Evaluation from './components/Evaluation';

function Header() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));

  useEffect(() => {
    // This effect ensures the button state updates if the token changes outside of direct logout
    const checkAdminStatus = () => {
      setIsAdminLoggedIn(!!localStorage.getItem('adminToken'));
    };
    window.addEventListener('storage', checkAdminStatus);
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setIsAdminLoggedIn(false); // Update state to reflect logout
    navigate('/');
  };
=======
  // For this test, simplify Header to only its JSX structure.
  // The logic for isAdminLoggedIn, useEffect, and handleLogout will be re-added later.
>>>>>>> 9178e3a (commit)

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src="/academic-affairs-logo.png" alt="Department of Academic Affairs Logo" className="logo" />
        </Link>
      </div>
      <div className="admin-section">
<<<<<<< HEAD
        {isAdminLoggedIn ? (
          <button onClick={handleLogout} className="admin-button">Logout</button>
        ) : (
          <Link to="/admin/login" className="admin-button">Admin Login</Link>
        )}
=======
        {/* Temporarily hardcode a simple link for testing the header rendering */}
        <Link to="/admin/login" className="admin-button">Admin Login (Test)</Link>
>>>>>>> 9178e3a (commit)
      </div>
    </header>
  );
}

function RegistrationForm() {
<<<<<<< HEAD
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Section 1: Student Details
    fullName: '',
    uid: '',
    department: '',
    phoneNumber: '',
    email: '',

    // Section 2: Previous Experience
    leadershipRoles: '',
    majorEvents: '',
    teamStrategy: '',
    multitaskingAbility: '',

    // Section 3: Academic Info
    cgpa: '',
    resume: null,

    // Section 4: Terms & Conditions
    terms: [false, false, false, false]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  const handleTermsChange = (index) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map((term, i) => i === index ? !term : term)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'terms') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'resume' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/registration`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Navigate to success page on successful submission
      navigate('/success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Section 1: Student Details */}
          <section className="form-section">
            <h2>Student Details</h2>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>UID</label>
              <input
                type="text"
                name="uid"
                value={formData.uid}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>

          {/* Section 2: Previous Experience */}
          <section className="form-section">
            <h2>Previous Experience</h2>
            <div className="input-group">
              <label>Previous Leadership Roles</label>
              <textarea
                name="leadershipRoles"
                value={formData.leadershipRoles}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Major Events Organized</label>
              <textarea
                name="majorEvents"
                value={formData.majorEvents}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Team Management Strategy</label>
              <textarea
                name="teamStrategy"
                value={formData.teamStrategy}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Multitasking Ability</label>
              <textarea
                name="multitaskingAbility"
                value={formData.multitaskingAbility}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>

          {/* Section 3: Academic Info & Resume */}
          <section className="form-section">
            <h2>Academic Information</h2>
            <div className="input-group">
              <label>Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Upload Resume (PDF/DOC/DOCX)</label>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </section>

          {/* Section 4: Terms & Conditions */}
          <section className="form-section">
            <h2>Terms & Conditions</h2>
            <div className="terms-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.terms[0]}
                  onChange={() => handleTermsChange(0)}
                  required
                />
                I agree to abide by the rules and regulations of Chandigarh University and the club.
              </label>
            </div>
            <div className="terms-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.terms[1]}
                  onChange={() => handleTermsChange(1)}
                  required
                />
                I certify that all the information provided is accurate and true to the best of my knowledge.
              </label>
            </div>
            <div className="terms-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.terms[2]}
                  onChange={() => handleTermsChange(2)}
                  required
                />
                I understand that submitting false information may lead to the cancellation of my registration.
              </label>
            </div>
            <div className="terms-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.terms[3]}
                  onChange={() => handleTermsChange(3)}
                  required
                />
                I grant permission for my resume and other submitted details to be reviewed for the purpose of club registration.
              </label>
            </div>
          </section>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
=======
  // Temporarily empty this component for the header test
  return <div>Registration Form - Not rendered for Header test</div>;
>>>>>>> 9178e3a (commit)
}

function App() {
  return (
    <Router>
<<<<<<< HEAD
      <Header />
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
=======
      <Header /> {/* This is the ONLY intended Header render */}
      <Routes>
        <Route path="/" element={<RegistrationForm />} /> {/* This will now just show the test message */}
>>>>>>> 9178e3a (commit)
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/registrations" element={<ManageRegistrations />} />
        <Route path="/admin/evaluations/:registrationId" element={<Evaluation />} />
      </Routes>
    </Router>
  );
}

export default App;
