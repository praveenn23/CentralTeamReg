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

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src="/academic-affairs-logo.png" alt="Department of Academic Affairs Logo" className="logo" />
        </Link>
      </div>
      <div className="admin-section">
        {isAdminLoggedIn ? (
          <button onClick={handleLogout} className="admin-button">Logout</button>
        ) : (
          <Link to="/admin/login" className="admin-button">Admin Login</Link>
        )}
      </div>
    </header>
  );
}

function RegistrationForm() {
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
      <Header />
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
              <label>Resume Upload</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
            </div>
          </section>

          {/* Section 4: Terms & Conditions */}
          <section className="form-section terms-section">
            <h2>Terms & Conditions</h2>
            <div className="terms">
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={formData.terms[0]}
                  onChange={() => handleTermsChange(0)}
                  required
                />
                <span>1. Accuracy of Information: I confirm that all the information provided in this form is accurate and true to the best of my knowledge.</span>
              </label>
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={formData.terms[1]}
                  onChange={() => handleTermsChange(1)}
                  required
                />
                <span>2. Code of Conduct Compliance: I agree to follow all rules, regulations, and the code of conduct set by the Department of Academic Affairs and the university club.</span>
              </label>
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={formData.terms[2]}
                  onChange={() => handleTermsChange(2)}
                  required
                />
                <span>3. Society Role Restriction: I confirm that I am not currently serving as a Secretary or Joint Secretary of any other society.</span>
              </label>
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={formData.terms[3]}
                  onChange={() => handleTermsChange(3)}
                  required
                />
                <span>4. Eligibility & Availability: I am a 3rd or 4th-year student and am available to attend offline meetings on a weekly basis.</span>
              </label>
            </div>
          </section>

          <div className="submit-container">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

      <footer className="footer">
        <p>© Department of Academic Affairs</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
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
