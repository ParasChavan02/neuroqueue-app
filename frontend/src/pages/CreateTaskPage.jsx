import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/client.js';

const defaultForm = { title: '', input: '', operation: 'uppercase' };

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/tasks', form);
      setForm(defaultForm);
      navigate(`/tasks/${response.data._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <p className="eyebrow">Create Task</p>
      <h1>Submit a new async job</h1>
      <form className="taskForm" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </label>
        <label>
          Input
          <textarea
            rows="8"
            value={form.input}
            onChange={(event) => setForm({ ...form, input: event.target.value })}
            required
          />
        </label>
        <label>
          Operation
          <select
            value={form.operation}
            onChange={(event) => setForm({ ...form, operation: event.target.value })}
          >
            <option value="uppercase">uppercase</option>
            <option value="lowercase">lowercase</option>
            <option value="reverse">reverse</option>
            <option value="word_count">word count</option>
          </select>
        </label>
        {error ? <p className="errorText">{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Create Task'}
        </button>
      </form>
    </section>
  );
}
