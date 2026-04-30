import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="authPage">
      <form className="card authCard" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to NeuroQueue</h1>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        {error ? <p className="errorText">{error}</p> : null}
        <button type="submit">Log in</button>
        <p className="muted">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </section>
  );
}

