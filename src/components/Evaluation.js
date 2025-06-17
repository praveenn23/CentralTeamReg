import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Evaluation.css';

const Evaluation = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvaluations = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/api/admin/evaluations`, {
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
        throw new Error('Failed to fetch evaluations');
      }

      const data = await response.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const validateScore = (value, maxScore) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return 0;
    if (numValue < 0) return 0;
    if (numValue > maxScore) return maxScore;
    return numValue;
  };

  const handleScoreChange = async (registrationId, field, value, maxScore) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
      const validatedValue = validateScore(value, maxScore);

      // Update local state first for immediate feedback
      setEvaluations(prevEvaluations => 
        prevEvaluations.map(evaluation => 
          evaluation.registrationId === registrationId 
            ? { ...evaluation, [field]: validatedValue }
            : evaluation
        )
      );

      // Send update to server
      const response = await fetch(`${apiUrl}/api/admin/evaluations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: validatedValue })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to update evaluation');
      }

      // Refresh evaluations after successful update
      await fetchEvaluations();
    } catch (err) {
      setError(err.message);
      // Revert local state on error
      fetchEvaluations();
    }
  };

  const handleResultChange = async (registrationId, value) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
      // Update local state first for immediate feedback
      setEvaluations(prevEvaluations => 
        prevEvaluations.map(evaluation => 
          evaluation.registrationId === registrationId 
            ? { ...evaluation, result: value }
            : evaluation
        )
      );

      // Send update to server
      const response = await fetch(`${apiUrl}/api/admin/evaluations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ result: value })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to update evaluation');
      }

      // Refresh evaluations after successful update
      await fetchEvaluations();
    } catch (err) {
      setError(err.message);
      // Revert local state on error
      fetchEvaluations();
    }
  };

  const calculateTotal = (evaluation) => {
    return (
      (evaluation.leadership || 0) +
      (evaluation.priorExperience || 0) +
      (evaluation.discipline || 0) +
      (evaluation.academics || 0) +
      (evaluation.attitude || 0) +
      (evaluation.timeManagement || 0)
    );
  };

  if (loading) {
    return <div className="loading">Loading evaluations...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="evaluation">
      <h2>Evaluation</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Name</th>
              <th>UID</th>
              <th>Leadership (20)</th>
              <th>Prior Exp. (15)</th>
              <th>Discipline (15)</th>
              <th>Academics (15)</th>
              <th>Attitude (15)</th>
              <th>Time Mgmt. (20)</th>
              <th>Total</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation, index) => (
              <tr key={evaluation.registrationId}>
                <td>{index + 1}</td>
                <td>{evaluation.fullName}</td>
                <td>{evaluation.uid}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={evaluation.leadership || ''}
                    onChange={(e) => handleScoreChange(evaluation.registrationId, 'leadership', e.target.value, 20)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={evaluation.priorExperience || ''}
                    onChange={(e) => handleScoreChange(evaluation.registrationId, 'priorExperience', e.target.value, 15)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={evaluation.discipline || ''}
                    onChange={(e) => handleScoreChange(evaluation.registrationId, 'discipline', e.target.value, 15)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={evaluation.academics || ''}
                    onChange={(e) => handleScoreChange(evaluation.registrationId, 'academics', e.target.value, 15)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={evaluation.attitude || ''}
                    onChange={(e) => handleScoreChange(evaluation.registrationId, 'attitude', e.target.value, 15)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={evaluation.timeManagement || ''}
                    onChange={(e) => handleScoreChange(evaluation.registrationId, 'timeManagement', e.target.value, 20)}
                  />
                </td>
                <td>{calculateTotal(evaluation)}</td>
                <td>
                  <select
                    value={evaluation.result || ''}
                    onChange={(e) => handleResultChange(evaluation.registrationId, e.target.value)}
                    className={evaluation.result}
                  >
                    <option value="">Select Result</option>
                    <option value="selected">Selected</option>
                    <option value="notSelected">Not Selected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Evaluation; 