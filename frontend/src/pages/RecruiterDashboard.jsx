import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Navbar from '../components/Navbar';
import MatchBridge from '../components/MatchBridge';

const STATUS_OPTIONS = ['applied', 'shortlisted', 'selected', 'rejected'];

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    api.getMyJobs().then((data) => {
      setJobs(data);
      if (data.length > 0) selectJob(data[0]);
    }).finally(() => setLoading(false));
  }, []);

  async function selectJob(job) {
    setSelectedJob(job);
    setLoadingCandidates(true);
    try {
      const data = await api.getCandidates(job.id);
      setCandidates(data);
    } finally {
      setLoadingCandidates(false);
    }
  }

  async function handleStatusChange(applicationId, status) {
    await api.updateApplicationStatus(applicationId, status);
    setCandidates((prev) => prev.map((c) => (c.id === applicationId ? { ...c, status } : c)));
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink">Your postings</h1>
            <p className="text-slate-650 text-sm">Select a role to see ranked candidates.</p>
          </div>
          <Link to="/post-job" className="bg-amber text-ink font-medium px-4 py-2 rounded-md text-sm hover:brightness-95 transition-all">
            + Post a job
          </Link>
        </div>

        {loading && <p className="text-slate-650 text-sm">Loading...</p>}
        {!loading && jobs.length === 0 && (
          <p className="text-slate-650 text-sm">You haven't posted any jobs yet.</p>
        )}

        {jobs.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 space-y-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => selectJob(job)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedJob?.id === job.id ? 'border-ink bg-white' : 'border-slate-200 bg-white/50 hover:bg-white'
                  }`}
                >
                  <p className="font-medium text-sm text-ink">{job.title}</p>
                  <p className="text-xs text-slate-650 mt-1">{job.application_count} applicant{job.application_count === '1' ? '' : 's'}</p>
                </button>
              ))}
            </div>

            <div className="col-span-2">
              {loadingCandidates && <p className="text-slate-650 text-sm">Loading candidates...</p>}
              {!loadingCandidates && candidates.length === 0 && (
                <p className="text-slate-650 text-sm">No applicants yet for this role.</p>
              )}
              <div className="space-y-3">
                {candidates.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display font-semibold text-ink text-sm">{c.name}</p>
                      <p className="text-xs text-slate-650">{c.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(c.skills || []).slice(0, 5).map((s) => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-650 px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MatchBridge score={c.match_score} />
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="text-xs border border-slate-300 rounded-md px-2 py-1.5 capitalize focus:outline-none focus:ring-2 focus:ring-amber"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
