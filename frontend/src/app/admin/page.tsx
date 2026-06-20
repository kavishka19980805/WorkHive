'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { showToast } from '@/redux/slices/uiSlice';
import { Shield, Flag, Trash2, Calendar, AlertTriangle } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  location: string;
  category: string;
  status: 'active' | 'flagged' | 'removed';
  createdAt: string;
  employer: {
    email: string;
  };
}

export default function AdminPanel() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [flaggedJobs, setFlaggedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAllJobs = async () => {
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      setLoading(true);
      // Fetch active jobs
      const resActive = await fetch(`${backendUrl}/jobs?status=active`);
      const dataActive = await resActive.json();

      // Fetch flagged jobs
      const resFlagged = await fetch(`${backendUrl}/jobs?status=flagged`);
      const dataFlagged = await resFlagged.json();

      if (dataActive.success) setActiveJobs(dataActive.data);
      if (dataFlagged.success) setFlaggedJobs(dataFlagged.data);
    } catch (err) {
      console.error('Error fetching jobs for admin:', err);
      dispatch(showToast({ message: 'Could not connect to job server', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, [token]);

  const handleFlagJob = async (id: string) => {
    setActionLoadingId(id);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const res = await fetch(`${backendUrl}/admin/jobs/${id}/flag`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        dispatch(showToast({ message: data?.error?.message || 'Failed to flag job', type: 'error' }));
      } else {
        dispatch(showToast({ message: 'Job flagged successfully!', type: 'success' }));
        // Move job from active to flagged locally
        const flaggedItem = activeJobs.find((job) => job.id === id);
        if (flaggedItem) {
          setActiveJobs((prev) => prev.filter((job) => job.id !== id));
          setFlaggedJobs((prev) => [...prev, { ...flaggedItem, status: 'flagged' }]);
        }
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Something went wrong', type: 'error' }));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveJob = async (id: string, fromList: 'active' | 'flagged') => {
    if (!confirm('Are you sure you want to permanently delete this job posting? This action cannot be undone.')) {
      return;
    }
    setActionLoadingId(id);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const res = await fetch(`${backendUrl}/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        dispatch(showToast({ message: data?.error?.message || 'Failed to remove job', type: 'error' }));
      } else {
        dispatch(showToast({ message: 'Job deleted permanently!', type: 'success' }));
        // Remove from local lists
        if (fromList === 'active') {
          setActiveJobs((prev) => prev.filter((job) => job.id !== id));
        } else {
          setFlaggedJobs((prev) => prev.filter((job) => job.id !== id));
        }
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Something went wrong', type: 'error' }));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Shield size={36} style={{ color: 'var(--primary)' }} />
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Admin Moderation Panel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Flag inappropriate postings or permanently remove jobs from the WorkHive platform
          </p>
        </div>
      </div>

      {loading ? (
        <div className="page-loader-wrapper">
          <div className="page-loader" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Flagged Jobs Section */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={20} />
              Flagged Postings ({flaggedJobs.length})
            </h2>

            {flaggedJobs.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No flagged job postings. Platform is currently clean!
              </div>
            ) : (
              <div className="table-container" style={{ borderColor: 'rgba(251, 113, 133, 0.3)' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company / Employer</th>
                      <th>Date Posted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flaggedJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.title}</div>
                          <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px' }}>
                            {job.category}
                          </span>
                        </td>
                        <td>{job.employer.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <Calendar size={14} />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-rose">FLAGGED</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleRemoveJob(job.id, 'flagged')}
                            className="btn btn-danger btn-sm"
                            style={{ gap: '6px' }}
                            disabled={actionLoadingId === job.id}
                          >
                            <Trash2 size={14} />
                            Delete Permanently
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Jobs Section */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Active Postings ({activeJobs.length})
            </h2>

            {activeJobs.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active job postings found.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company / Employer</th>
                      <th>Date Posted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.title}</div>
                          <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px' }}>
                            {job.category}
                          </span>
                        </td>
                        <td>{job.employer.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <Calendar size={14} />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-emerald">ACTIVE</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                              onClick={() => handleFlagJob(job.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ gap: '6px', color: 'var(--warning)', borderColor: 'rgba(251, 113, 133, 0.2)' }}
                              disabled={actionLoadingId === job.id}
                            >
                              <Flag size={14} />
                              Flag
                            </button>
                            <button
                              onClick={() => handleRemoveJob(job.id, 'active')}
                              className="btn btn-danger btn-sm"
                              style={{ gap: '6px' }}
                              disabled={actionLoadingId === job.id}
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
