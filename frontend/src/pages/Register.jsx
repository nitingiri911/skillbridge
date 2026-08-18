import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'recruiter') payload.company_name = companyName;

      const data = await api.register(payload);
      login(data.user, data.token);
      navigate(data.user.role === 'student' ? '/jobs' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-3xl text-ink">
            Skill<span className="text-amber">Bridge</span>
          </h1>
          <p className="text-slate-650 text-sm mt-2">Create your account</p>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-md p-1 mb-4">
          {['student', 'recruiter'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 text-sm font-medium py-2 rounded-md capitalize transition-colors ${
                role === r ? 'bg-ink text-white' : 'text-slate-650'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>

          {role === 'recruiter' && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Company name</label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white font-medium py-2.5 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-650 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-ink font-medium underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
