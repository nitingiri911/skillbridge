import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Navbar from '../components/Navbar';

export default function StudentProfile() {
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.getMyProfile();
      setSkills((data.skills || []).join(', '));
      setInterests((data.interests || []).join(', '));
      setCgpa(data.cgpa || '');
      setCollege(data.college || '');
      setBranch(data.branch || '');
      setGraduationYear(data.graduation_year || '');
setResumeUrl(data.resume_url || '');
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
}

async function handleResumeUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    setResumeError('Please upload a PDF file.');
    return;
  }
  setResumeError('');
  setUploadingResume(true);
  try {
    const data = await api.uploadResume(file);
    setResumeUrl(data.key);
  } catch (err) {
    setResumeError(err.message);
  } finally {
    setUploadingResume(false);
  }
}

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.updateMyProfile({
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        cgpa: cgpa ? parseFloat(cgpa) : null,
        college,
        branch,
        graduation_year: graduationYear ? parseInt(graduationYear) : null,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-2xl text-ink mb-1">Your profile</h1>
        <p className="text-slate-650 text-sm mb-6">Keep this updated — it drives your match scores.</p>

        {loading ? (
          <p className="text-slate-650 text-sm">Loading...</p>
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md">{error}</div>}
            {saved && <div className="bg-teal/10 text-teal-700 text-sm px-3 py-2 rounded-md">Profile saved.</div>}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Skills (comma-separated)</label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, Python, SQL"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Interests (comma-separated)</label>
              <input
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Web development, AI, Cloud"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Graduation year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">College</label>
              <input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Branch</label>
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>

                        <div>
              <label className="block text-sm font-medium text-ink mb-1">Resume (PDF)</label>
              {resumeUrl && (
                <p className="text-xs text-teal-700 mb-2">✓ Resume uploaded</p>
              )}
              {resumeError && (
                <p className="text-xs text-red-600 mb-2">{resumeError}</p>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="w-full text-sm text-slate-650 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-ink file:text-white file:text-sm file:font-medium hover:file:bg-slate-800 file:cursor-pointer"
              />
              {uploadingResume && <p className="text-xs text-slate-650 mt-1">Uploading...</p>}
              <p className="text-xs text-slate-650 mt-1">Max 5MB, PDF only.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-white font-medium px-5 py-2.5 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
