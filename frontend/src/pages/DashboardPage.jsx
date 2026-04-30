import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/client.js';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    const response = await api.get('/tasks');
    setTasks(response.data);
  };

  useEffect(() => {
    fetchTasks().catch(() => setError('Unable to load tasks'));
  }, []);

  return (
    <section className="card">
      {error ? <p className="errorText">{error}</p> : null}
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Task Queue</p>
          <h2>Recent jobs</h2>
        </div>
        <div className="buttonRow">
          <Link className="buttonLink" to="/tasks/new">
            Create Task
          </Link>
          <button
            className="secondaryButton"
            onClick={() => fetchTasks().catch(() => setError('Unable to refresh tasks'))}
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="taskList">
        {tasks.map((task) => (
          <Link key={task._id} className="taskItem" to={`/tasks/${task._id}`}>
            <div>
              <strong>{task.title}</strong>
              <p className="muted">
                {task.operation} • {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`status status-${task.status}`}>{task.status}</span>
          </Link>
        ))}
        {tasks.length === 0 ? <p className="muted">No tasks yet.</p> : null}
      </div>
    </section>
  );
}
