import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-ink text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-display font-bold text-lg tracking-tight">
        Skill<span className="text-amber">Bridge</span>
      </Link>

      {user && (
        <div className="flex items-center gap-6 text-sm">
          {user.role === 'student' ? (
            <>
              <Link to="/jobs" className="hover:text-amber transition-colors">Jobs</Link>
              <Link to="/applications" className="hover:text-amber transition-colors">My Applications</Link>
              <Link to="/profile" className="hover:text-amber transition-colors">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/post-job" className="hover:text-amber transition-colors">Post a Job</Link>
              <Link to="/dashboard" className="hover:text-amber transition-colors">Dashboard</Link>
            </>
          )}
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">{user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-amber text-ink px-3 py-1.5 rounded-md font-medium hover:brightness-95 transition-all"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
