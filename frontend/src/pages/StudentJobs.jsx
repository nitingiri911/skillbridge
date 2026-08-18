import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Navbar from '../components/Navbar';
import MatchBridge from '../components/MatchBridge';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(jobId) {
    setApplyingId(jobId);
    try {
      await api.applyToJob(jobId);
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      alert(err.message);
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Matched opportunities</h1>
        <p className="text-slate-650 text-sm mb-6">Sorted by how well your skills fit each role.</p>

        {loading && <p className="text-slate-650 text-sm">Loading jobs...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && jobs.length === 0 && (
          <p className="text-slate-650 text-sm">No jobs posted yet. Check back soon.</p>
        )}

        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-ink">{job.title}</h3>
                  <p className="text-sm text-slate-650">{job.company_name} · {job.location || 'Remote'}</p>
                  {job.description && (
                    <p className="text-sm text-slate-650 mt-2 line-clamp-2">{job.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(job.required_skills || []).map((skill) => (
                      <span key={skill} className="text-xs bg-slate-100 text-slate-650 px-2 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <MatchBridge score={job.match_score} />
                  {job.stipend && <span className="text-xs text-slate-650">{job.stipend}</span>}
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingId === job.id || appliedIds.has(job.id)}
                    className="text-sm font-medium bg-amber text-ink px-4 py-1.5 rounded-md hover:brightness-95 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {appliedIds.has(job.id) ? 'Applied' : applyingId === job.id ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
