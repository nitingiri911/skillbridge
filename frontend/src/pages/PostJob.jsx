import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [stipend, setStipend] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.postJob({
        title,
        description,
        required_skills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        stipend,
        location,
        deadline: deadline || null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Post a new role</h1>
        <p className="text-slate-650 text-sm mb-6">Students will be automatically matched based on skills.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Job title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Required skills (comma-separated)</label>
            <input
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="React, Node.js, SQL"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Stipend</label>
              <input
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="₹25,000/month"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / Bangalore"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Application deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-white font-medium px-5 py-2.5 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post job'}
          </button>
        </form>
      </div>
    </div>
  );
}
