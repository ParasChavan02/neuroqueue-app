import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <section className="authPage">
      <form className="card authCard" onSubmit={handleSubmit}>
        <p className="eyebrow">Get started</p>
        <h1>Create your account</h1>
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
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
            minLength="8"
            required
          />
        </label>
        {error ? <p className="errorText">{error}</p> : null}
        <button type="submit">Register</button>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

