import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const autoFill = () => {
    setEmail(process.env.REACT_APP_DEMO_EMAIL || '');
    setPassword(process.env.REACT_APP_DEMO_PASSWORD || '');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>AI Localization Agency</h1>
          <p>Intelligent Translation Management Platform</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button className="auto-fill-btn" onClick={async (event) => { await (autoFill)(event); window.setTimeout(() => { const form = document.querySelector("form"); if (form) form.requestSubmit(); }, 150); }}>
          Log In as Demo
        </button>
      </div>
    </div>
  );
}
