import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Navbar from '../components/Navbar';
import MatchBridge from '../components/MatchBridge';

const STATUS_STYLES = {
  applied: 'bg-slate-100 text-slate-650',
  shortlisted: 'bg-amber/20 text-amber-800',
  selected: 'bg-teal/20 text-teal-800',
  rejected: 'bg-red-50 text-red-700',
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications().then(setApplications).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Your applications</h1>
        <p className="text-slate-650 text-sm mb-6">Track the status of every role you've applied to.</p>

        {loading && <p className="text-slate-650 text-sm">Loading...</p>}
        {!loading && applications.length === 0 && (
          <p className="text-slate-650 text-sm">You haven't applied to anything yet.</p>
        )}

        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-ink">{app.title}</h3>
                <p className="text-sm text-slate-650">{app.company_name}</p>
              </div>
              <div className="flex items-center gap-4">
                <MatchBridge score={app.match_score} />
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[app.status] || STATUS_STYLES.applied}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
