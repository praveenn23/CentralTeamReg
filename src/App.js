import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import './App.css';
import SuccessPage from './components/SuccessPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ManageRegistrations from './components/ManageRegistrations';
import Evaluation from './components/Evaluation';

function Header({ isSidebarOpen, toggleSidebar, handleOverlayClick }) {
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [isVisible, setIsVisible] = useState(true); // State to control header visibility
  const [lastScrollY, setLastScrollY] = useState(0); // State to track last scroll position

  useEffect(() => {
    // This effect ensures the button state updates if the token changes outside of direct logout
    const checkAdminStatus = () => {
      setIsAdminLoggedIn(!!localStorage.getItem('adminToken'));
    };
    window.addEventListener('storage', checkAdminStatus);

    // Handle scroll to show/hide header
    const handleScroll = () => {
      if (window.scrollY < lastScrollY) { // Scrolling up
        setIsVisible(true);
      } else if (window.scrollY > lastScrollY && window.scrollY > 100) { // Scrolling down past a threshold
        setIsVisible(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', checkAdminStatus);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]); // Re-run effect when lastScrollY changes

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setIsAdminLoggedIn(false); // Update state to reflect logout
    navigate('/');
  };

  return (
    <header className={`header ${isVisible ? '' : 'header-hidden'}`}>
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
      {/* Mobile Navigation Toggle (Hamburger Menu) */}
      <button
        className="mobile-nav-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
    </header>
  );
}

function RegistrationForm({ isSidebarOpen, setIsSidebarOpen, handleOverlayClick }) {
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
  const [success, setSuccess] = useState('');
  const [showOtherPositionField, setShowOtherPositionField] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [sectionErrors, setSectionErrors] = useState({});

  // Clear errors and reset submission attempt when activeSection changes
  useEffect(() => {
    setSectionErrors({});
    setHasAttemptedSubmit(false);
  }, [activeSection]);

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
        [name]: value || '' // Ensure value is never undefined
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
    let currentSectionError = '';
    let isValid = true;

    switch (activeSection) {
      case 'student-details':
        if (!formData.fullName || !formData.uid || !formData.cluster || !formData.institute || !formData.phoneNumber || !formData.email) {
          currentSectionError = 'Please fill in all Student Details fields.';
          isValid = false;
        }
        if (isValid && !/[0-9]{10}$/.test(formData.phoneNumber)) {
          currentSectionError = 'Phone number must be exactly 10 digits long and start with +91.';
          isValid = false;
        }
        if (isValid && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
          currentSectionError = 'Please enter a valid email address.';
          isValid = false;
        }
        break;
      case 'experience':
        if (!formData.leadershipRoles || !formData.yourPosition || (showOtherPositionField && !formData.otherPositionName) || !formData.nameOfEntity || !formData.sop || !formData.linkedinAccount || !formData.resume) {
          currentSectionError = 'Please fill in all Experience fields.';
          isValid = false;
        }
        break;
      case 'recommendation':
        if (!formData.recommendationLetter) {
          currentSectionError = 'Please upload your Recommendation Letter.';
          isValid = false;
        }
        break;
      case 'terms':
        if (formData.terms.some(term => !term)) {
          currentSectionError = 'Please agree to all Terms & Conditions.';
          isValid = false;
        }
        break;
      default:
        isValid = true;
    }
    return { isValid, currentSectionError };
  };

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    const { isValid, currentSectionError } = validateCurrentSection();

    if (isValid) {
      const sections = ['student-details', 'experience', 'recommendation', 'terms'];
      const currentIndex = sections.indexOf(activeSection);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1]);
        setSectionErrors({});
      }
    } else {
      setSectionErrors(prev => ({ ...prev, [activeSection]: currentSectionError }));
    }
  };

  const handlePrevious = () => {
    const sections = ['student-details', 'experience', 'recommendation', 'terms'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
      setSectionErrors({});
      setHasAttemptedSubmit(false);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const validateFileSize = (file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
    }
  };

  const submitForm = async (formData) => {
    try {
      console.log('Starting form submission...');
      
      // Log form data before sending
      console.log('Form data being sent:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const response = await fetch('https://central-team-reg-backend.onrender.com/api/registration', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
        // Force HTTP/1.1
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'include',
        // Disable HTTP/2
        keepalive: true,
        // Increase timeout
        signal: AbortSignal.timeout(120000) // 2 minutes
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Submission successful:', result);
      setSuccess('Registration submitted successfully!');
      setSectionErrors({}); // Clear all section errors on successful submission
      navigate('/success');

    } catch (err) {
      console.error('Submission error:', err);
      setSectionErrors(prev => ({ ...prev, [activeSection]: err.message || 'An unexpected error occurred. Please try again.' }));
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setLoading(true);
    setSectionErrors({});
    setSuccess('');

    const { isValid, currentSectionError } = validateCurrentSection();

    if (isValid) {
      const submitFormData = new FormData();
      for (const key in formData) {
        if (formData[key] instanceof File) {
          try {
            validateFileSize(formData[key]);
            submitFormData.append(key, formData[key]);
          } catch (fileError) {
            setSectionErrors(prev => ({ ...prev, [activeSection]: fileError.message }));
            setLoading(false);
            return;
          }
        } else if (key === 'terms') {
          submitFormData.append(key, JSON.stringify(formData[key]));
        } else {
          submitFormData.append(key, formData[key]);
        }
      }

      await submitForm(submitFormData);
    } else {
      setSectionErrors(prev => ({ ...prev, [activeSection]: currentSectionError }));
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'student-details':
        return (
          <div className="form-section">
            <h2>Student Details</h2>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="fullName">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.fullName ? 'input-error' : ''}`}
                />
              </div>
              <div className="input-group">
                <label htmlFor="uid">UID <span className="required">*</span></label>
                <input
                  type="text"
                  id="uid"
                  name="uid"
                  value={formData.uid}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.uid ? 'input-error' : ''}`}
                />
              </div>
              <div className="input-group">
                <label htmlFor="cluster">Cluster <span className="required">*</span></label>
                <select
                  id="cluster"
                  name="cluster"
                  value={formData.cluster}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.cluster ? 'input-error' : ''}`}
                >
                  <option value="">Select Cluster</option>
                  {clusters.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="institute">Institute <span className="required">*</span></label>
                <select
                  id="institute"
                  name="institute"
                  value={formData.institute}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.institute ? 'input-error' : ''}`}
                >
                  <option value="">Select Institute</option>
                  {institutes.map((inst, i) => <option key={i} value={inst}>{inst}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="phoneNumber">Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91XXXXXXXXXX"
                  pattern="\+91[0-9]{10}"
                  title="Phone number must be exactly 10 digits long and start with +91."
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && (!formData.phoneNumber || !/[0-9]{10}$/.test(formData.phoneNumber)) ? 'input-error' : ''}`}
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && (!formData.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) ? 'input-error' : ''}`}
                />
              </div>
            </div>
            <div className="form-navigation">
              <button type="button" onClick={handleNext} className="nav-button">Next</button>
            </div>
          </div>
        );
      case 'experience':
        return (
          <div className="form-section">
            <h2>Experience</h2>
            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="leadershipRoles">Describe your leadership roles and responsibilities in past projects/events/organizations. <span className="required">*</span></label>
                <textarea
                  id="leadershipRoles"
                  name="leadershipRoles"
                  value={formData.leadershipRoles}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`leadership-roles-textarea ${hasAttemptedSubmit && !formData.leadershipRoles ? 'input-error' : ''}`}
                ></textarea>
              </div>
              <div className="input-group">
                <label htmlFor="yourPosition">Your Position <span className="required">*</span></label>
                <select
                  id="yourPosition"
                  name="yourPosition"
                  value={formData.yourPosition}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.yourPosition ? 'input-error' : ''}`}
                >
                  <option value="">Select Position</option>
                  <option value="President">President</option>
                  <option value="Vice-President">Vice-President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Member">Member</option>
                  <option value="Other Leadership Position">Other Leadership Position</option>
                </select>
              </div>
              {showOtherPositionField && (
                <div className="input-group">
                  <label htmlFor="otherPositionName">Specify Other Position <span className="required">*</span></label>
                  <input
                    type="text"
                    id="otherPositionName"
                    name="otherPositionName"
                    value={formData.otherPositionName}
                    onChange={handleInputChange}
                    autoComplete="off"
                    onInvalid={(e) => e.preventDefault()}
                    formNoValidate
                    className={`${hasAttemptedSubmit && !formData.otherPositionName ? 'input-error' : ''}`}
                  />
                </div>
              )}
              <div className="input-group">
                <label htmlFor="nameOfEntity">Name of the Entity/Organization <span className="required">*</span></label>
                <input
                  type="text"
                  id="nameOfEntity"
                  name="nameOfEntity"
                  value={formData.nameOfEntity}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.nameOfEntity ? 'input-error' : ''}`}
                />
              </div>
              <div className="input-group full-width">
                <label htmlFor="sop">Statement of Purpose (SOP) <span className="required">*</span></label>
                <small>Max 10MB, PDF only</small>
                <input
                  type="file"
                  id="sop"
                  name="sop"
                  onChange={handleFileChange}
                  accept=".pdf"
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.sop ? 'input-error' : ''}`}
                />
              </div>
              <div className="input-group">
                <label htmlFor="resume">Upload Resume <span className="required">*</span></label>
                <small>Max 10MB, PDF only</small>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf"
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  className={`${hasAttemptedSubmit && !formData.resume ? 'input-error' : ''}`}
                />
              </div>
              <div className="input-group">
                <label htmlFor="linkedinAccount">LinkedIn Profile URL <span className="required">*</span></label>
                <input
                  type="url"
                  id="linkedinAccount"
                  name="linkedinAccount"
                  value={formData.linkedinAccount}
                  onChange={handleInputChange}
                  autoComplete="off"
                  onInvalid={(e) => e.preventDefault()}
                  formNoValidate
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  className={`${hasAttemptedSubmit && !formData.linkedinAccount ? 'input-error' : ''}`}
                />
              </div>
            </div>
            <div className="form-navigation">
              <button type="button" onClick={handlePrevious} className="nav-button">Previous</button>
              <button type="button" onClick={handleNext} className="nav-button">Next</button>
            </div>
          </div>
        );
      case 'recommendation':
        return (
          <div className="form-section">
            <h2>Recommendation</h2>
            <div className="input-group full-width">
              <label htmlFor="recommendationLetter">Upload Recommendation Letter <span className="required">*</span></label>
              <small>Max 10MB, PDF only</small>
              <input
                type="file"
                id="recommendationLetter"
                name="recommendationLetter"
                onChange={handleFileChange}
                accept=".pdf"
                autoComplete="off"
                onInvalid={(e) => e.preventDefault()}
                formNoValidate
                className={`${hasAttemptedSubmit && !formData.recommendationLetter ? 'input-error' : ''}`}
              />
            </div>
            <div className="form-navigation">
              <button type="button" onClick={handlePrevious} className="nav-button">Previous</button>
              <button type="button" onClick={handleNext} className="nav-button">Next</button>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="form-section">
            <h2>Terms & Conditions</h2>
            {hasAttemptedSubmit && sectionErrors['terms'] && <div className="error-message">{sectionErrors['terms']}</div>}
            <div className="terms-section">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="terms-item">
                  <input
                    type="checkbox"
                    id={`term-${index}`}
                    checked={formData.terms[index]}
                    onChange={() => handleTermsChange(index)}
                    className={`${hasAttemptedSubmit && !formData.terms[index] ? 'input-error' : ''}`}
                  />
                  <label htmlFor={`term-${index}`}>
                    {index === 0 && 'I agree to abide by the rules and regulations of Chandigarh University and the club.'}
                    {index === 1 && 'I certify that all the information provided is accurate and true to the best of my knowledge.'}
                    {index === 2 && 'I understand that submitting false information may lead to the cancellation of my registration.'}
                    {index === 3 && 'I grant permission for my resume and other submitted details to be reviewed for the purpose of club registration.'}
                    <span className="required">*</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="form-navigation">
              <button type="button" onClick={handlePrevious} className="nav-button">Previous</button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      onInvalid={(e) => {
        e.preventDefault();
      }}
      noValidate
      novalidate
      autoComplete="off"
    >
      <div className="form-layout">
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <button
            className="sidebar-item"
            onClick={() => {
              setActiveSection('student-details');
              setIsSidebarOpen(false);
              setSectionErrors({}); // Clear all section errors
              setHasAttemptedSubmit(false);
            }}
          >
            Student Details
          </button>
          <button
            className="sidebar-item"
            onClick={() => {
              setActiveSection('experience');
              setIsSidebarOpen(false);
              setSectionErrors({}); // Clear all section errors
              setHasAttemptedSubmit(false);
            }}
          >
            Experience
          </button>
          <button
            className="sidebar-item"
            onClick={() => {
              setActiveSection('recommendation');
              setIsSidebarOpen(false);
              setSectionErrors({}); // Clear all section errors
              setHasAttemptedSubmit(false);
            }}
          >
            Recommendation
          </button>
          <button
            className="sidebar-item"
            onClick={() => {
              setActiveSection('terms');
              setIsSidebarOpen(false);
              setSectionErrors({}); // Clear all section errors
              setHasAttemptedSubmit(false);
            }}
          >
            Terms & Conditions
          </button>
        </div>

        <div className="form-content">
          {renderSection()}
        </div>
      </div>
    </form>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} handleOverlayClick={handleOverlayClick} />
        <Routes>
          <Route path="/" element={<RegistrationForm isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleOverlayClick={handleOverlayClick} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-registrations" element={<ManageRegistrations />} />
          <Route path="/admin/evaluate/:id" element={<Evaluation />} />
        </Routes>
        <footer className="footer">© 2023 Chandigarh University. All rights reserved.</footer>

        {/* Sidebar Overlay - RENDERED HERE AT APP LEVEL */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay active"
            onClick={handleOverlayClick}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
