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
    cluster: '',
    institute: '',
    phoneNumber: '+91',
    email: '',

    // Section 2: Experience
    leadershipRoles: '',
    yourPosition: '',
    otherPositionName: '',
    nameOfEntity: '',
    sop: null,
    resume: null,
    linkedinAccount: '',

    // Section 3: Recommendation
    recommendationLetter: null,

    // Section 4: Terms & Conditions
    terms: [false, false, false, false]
  });

  const clusters = [
    'Engineering and Technology',
    'Liberal Arts and Humanities',
    'Management',
    'Health and Applied Science',
    'Basic and Applied Science'
  ];

  const institutes = [
    'University Institute of Engineering (UIE)',
    'Academic Unit',
    'University Institute of Computing (UIC)',
    'Apex Institute of Technology(AIT)',
    'University Institute of Teachers Training and Research (UITTR)',
    'University Institute of Design (UID)',
    'University Institute of Liberal Arts and Humanities  (UILH)',
    'University Institute of Architecture (UIA)',
    'University Institute of Film and Visual Arts (UIFVA)',
    'University Institute of Media Studies (UIMS)',
    'University Institute of Tourism & Hospitality Management (UITHM)',
    'University Institute of Legal Studies (UILS)',
    'University School of Business (USB)',
    'University Institute of Pharmaceutical Sciences (UIPS)',
    'University Institute of Applied Health Sciences (UIAHS)',
    'University Institute of Sciences (UIS)',
    'University Institute of Bio-Technology (UIBT)',
    'University Institute of Agricultural Sciences (UIAS)'
  ];

  const [activeSection, setActiveSection] = useState('student-details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtherPositionField, setShowOtherPositionField] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      // Ensure it always starts with +91 and only allows digits after
      if (!value.startsWith('+91')) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: '+91'
        }));
        return;
      }
      const numericValue = value.substring(3).replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: '+91' + numericValue
        }));
      }
    } else if (name === 'yourPosition') {
      setShowOtherPositionField(value === 'Other Leadership Position');
      setFormData(prev => ({
        ...prev,
        [name]: value,
        otherPositionName: value === 'Other Leadership Position' ? prev.otherPositionName : '' // Clear if not 'Other'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleTermsChange = (index) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map((term, i) => i === index ? !term : term)
    }));
  };

  const validateCurrentSection = () => {
    setError(''); // Clear previous errors
    switch (activeSection) {
      case 'student-details':
        if (!formData.fullName || !formData.uid || !formData.cluster || !formData.institute || !formData.phoneNumber || !formData.email) {
          setError('Please fill in all Student Details fields.');
          return false;
        }
        if (!/^\+91\d{10}$/.test(formData.phoneNumber)) {
          setError('Phone number must be exactly 10 digits long and start with +91.');
          return false;
        }
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
          setError('Please enter a valid email address.');
          return false;
        }
        break;
      case 'experience':
        if (!formData.leadershipRoles || !formData.yourPosition || (showOtherPositionField && !formData.otherPositionName) || !formData.nameOfEntity || !formData.sop || !formData.linkedinAccount || !formData.resume) {
          setError('Please fill in all Experience fields.');
          return false;
        }
        break;
      case 'recommendation':
        if (!formData.recommendationLetter) {
          setError('Please upload your Recommendation Letter.');
          return false;
        }
        break;
      case 'terms':
        if (formData.terms.some(term => !term)) {
          setError('Please agree to all Terms & Conditions.');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      const sections = ['student-details', 'experience', 'recommendation', 'terms'];
      const currentIndex = sections.indexOf(activeSection);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentSection()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'terms') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'sop' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'resume' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'recommendationLetter' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key !== 'otherPositionName' || (key === 'otherPositionName' && showOtherPositionField)) { // Only append otherPositionName if it's shown
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

      navigate('/success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'student-details':
        return (
          <section className="form-section">
            <h2>Student Details</h2>
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>UID <span className="required">*</span></label>
                <input
                  type="text"
                  name="uid"
                  value={formData.uid}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Cluster <span className="required">*</span></label>
                <select
                  name="cluster"
                  value={formData.cluster}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Cluster</option>
                  {clusters.map((cluster, index) => (
                    <option key={index} value={cluster}>{cluster}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Institute <span className="required">*</span></label>
                <select
                  name="institute"
                  value={formData.institute}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Institute</option>
                  {institutes.map((institute, index) => (
                    <option key={index} value={institute}>{institute}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  pattern="^\+91\d{10}$"
                  maxLength="13"
                  title="Phone number must be 10 digits long and start with +91"
                  required
                />
              </div>
              <div className="input-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </section>
        );
      case 'experience':
        return (
          <section className="form-section">
            <h2>Experience</h2>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>Previous Leadership Roles <span className="required">*</span></label>
                <textarea
                  name="leadershipRoles"
                  value={formData.leadershipRoles}
                  onChange={handleInputChange}
                  maxLength="1000"
                  placeholder="1-\n2-\n3-\n4-"
                  required
                />
                <small>{formData.leadershipRoles.length}/1000 characters</small>
              </div>
              <div className="input-group">
                <label>Your Position <span className="required">*</span></label>
                <select
                  name="yourPosition"
                  value={formData.yourPosition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Position</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Joint Secretary">Joint Secretary</option>
                  <option value="Other Leadership Position">Other Leadership Position</option>
                </select>
              </div>
              {showOtherPositionField && (
                <div className="input-group">
                  <label>Other Position Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="otherPositionName"
                    value={formData.otherPositionName}
                    onChange={handleInputChange}
                    required={showOtherPositionField} /* Conditionally required */
                  />
                </div>
              )}
              <div className="input-group">
                <label>Name of your entity <span className="required">*</span></label>
                <input
                  type="text"
                  name="nameOfEntity"
                  value={formData.nameOfEntity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Upload Statement of Purpose (PDF/DOC/DOCX) <span className="required">*</span></label>
                <input
                  type="file"
                  name="sop"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Upload Resume (PDF/DOC/DOCX) <span className="required">*</span></label>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>LinkedIn Account <span className="required">*</span></label>
                <input
                  type="url"
                  name="linkedinAccount"
                  value={formData.linkedinAccount}
                  onChange={handleInputChange}
                  placeholder="e.g., https://linkedin.com/in/yourprofile"
                  required
                />
              </div>
            </div>
          </section>
        );
      case 'recommendation':
        return (
          <section className="form-section">
            <h2>Recommendation</h2>
            <div className="form-grid">
              <div className="input-group">
                <label>Upload Recommendation Letter (PDF/DOC/DOCX) <span className="required">*</span></label>
                <input
                  type="file"
                  name="recommendationLetter"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>
          </section>
        );
      case 'terms':
        return (
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
                <span className="required">*</span> I agree to abide by the rules and regulations of Chandigarh University and the club.
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
                <span className="required">*</span> I certify that all the information provided is accurate and true to the best of my knowledge.
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
                <span className="required">*</span> I understand that submitting false information may lead to the cancellation of my registration.
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
                <span className="required">*</span> I grant permission for my resume and other submitted details to be reviewed for the purpose of club registration.
              </label>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            <div className="sidebar">
              <button
                type="button"
                className={`sidebar-item ${activeSection === 'student-details' ? 'active' : ''}`}
                onClick={() => setActiveSection('student-details')}
              >
                Student Details
              </button>
              <button
                type="button"
                className={`sidebar-item ${activeSection === 'experience' ? 'active' : ''}`}
                onClick={() => setActiveSection('experience')}
              >
                Experience
              </button>
              <button
                type="button"
                className={`sidebar-item ${activeSection === 'recommendation' ? 'active' : ''}`}
                onClick={() => setActiveSection('recommendation')}
              >
                Recommendation
              </button>
              <button
                type="button"
                className={`sidebar-item ${activeSection === 'terms' ? 'active' : ''}`}
                onClick={() => setActiveSection('terms')}
              >
                Terms & Conditions
              </button>
            </div>
            <div className="form-content">
              {renderSection()}
              <div className="form-navigation">
                {activeSection !== 'student-details' && (
                  <button
                    type="button"
                    className="nav-button"
                    onClick={() => {
                      const sections = ['student-details', 'experience', 'recommendation', 'terms'];
                      const currentIndex = sections.indexOf(activeSection);
                      setActiveSection(sections[currentIndex - 1]);
                    }}
                  >
                    Previous
                  </button>
                )}
                {activeSection !== 'terms' ? (
                  <button
                    type="button"
                    className="nav-button"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                ) : (
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
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
        <Route path="/admin/manage-registrations" element={<ManageRegistrations />} />
        <Route path="/admin/evaluations/:registrationId" element={<Evaluation />} />
      </Routes>
    </Router>
  );
}

export default App;
