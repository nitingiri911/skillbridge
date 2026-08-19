const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('sb_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  getMyProfile: () => request('/students/me'),
  updateMyProfile: (payload) => request('/students/me', { method: 'PUT', body: JSON.stringify(payload) }),

  uploadResume: async (file) => {
  const token = localStorage.getItem('sb_token');
  const formData = new FormData();
  formData.append('resume', file);
  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
},
  getResumeUrl: (key) => request(`/resume/${encodeURIComponent(key)}/url`),

  getJobs: () => request('/jobs'),
  getMyJobs: () => request('/jobs/mine'),
  postJob: (payload) => request('/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  getCandidates: (jobId) => request(`/jobs/${jobId}/candidates`),

  applyToJob: (job_id) => request('/applications', { method: 'POST', body: JSON.stringify({ job_id }) }),
  getMyApplications: () => request('/applications/me'),
  updateApplicationStatus: (id, status) =>
    request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
