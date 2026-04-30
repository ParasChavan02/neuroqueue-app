import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../api/client.js';

export default function TaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');

  const fetchTask = async () => {
    const response = await api.get(`/tasks/${id}`);
    setTask(response.data);
  };

  useEffect(() => {
    fetchTask().catch(() => setError('Unable to load task details'));
    const timer = setInterval(() => {
      fetchTask().catch(() => undefined);
    }, 5000);

    return () => clearInterval(timer);
  }, [id]);

  const rerunTask = async () => {
    try {
      await api.post(`/tasks/${id}/run`);
      await fetchTask();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to rerun task');
    }
  };

  if (error) {
    return <p className="errorText">{error}</p>;
  }

  if (!task) {
    return <p className="muted">Loading task details...</p>;
  }

  return (
    <section className="card detailCard">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Task Details</p>
          <h1>{task.title}</h1>
        </div>
        <button className="secondaryButton" onClick={rerunTask}>
          Re-run
        </button>
      </div>
      <div className="detailGrid">
        <div>
          <p className="muted">Status</p>
          <span className={`status status-${task.status}`}>{task.status}</span>
        </div>
        <div>
          <p className="muted">Operation</p>
          <strong>{task.operation}</strong>
        </div>
        <div>
          <p className="muted">Attempts</p>
          <strong>{task.attempts}</strong>
        </div>
        <div>
          <p className="muted">Created</p>
          <strong>{new Date(task.createdAt).toLocaleString()}</strong>
        </div>
      </div>
      <div className="detailSection">
        <p className="muted">Input</p>
        <pre>{task.input}</pre>
      </div>
      <div className="detailSection">
        <p className="muted">Result</p>
        <pre>{task.result || 'Not available yet'}</pre>
      </div>
      <div className="detailSection">
        <p className="muted">Logs</p>
        <div className="logsPanel">
          {task.logs.map((entry, index) => (
            <p key={`${entry}-${index}`}>{entry}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

