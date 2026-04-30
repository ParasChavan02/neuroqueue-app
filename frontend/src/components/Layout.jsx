import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">NeuroQueue</p>
          <h1>AI Task Processing</h1>
          <p className="muted">Queue-driven text jobs with live task history.</p>
        </div>
        <nav className="nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/tasks/new">Create Task</NavLink>
        </nav>
        <div className="sidebarFooter">
          <p>{user?.name}</p>
          <button onClick={logout} className="secondaryButton">
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
