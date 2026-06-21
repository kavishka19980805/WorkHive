'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { showToast } from '@/redux/slices/uiSlice';
import { Briefcase, Calendar, FileText, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

interface Application {
  id: string;
  jobId: string;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl: string;
  appliedAt: string;
  job: {
    title: string;
    location: string;
    category: string;
    employer: {
      email: string;
    };
  };
}

export default function SeekerDashboard() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return;
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      try {
        const res = await fetch(`${backendUrl}/applications/mine`, {
          headers: { 'ngrok-skip-browser-warning': 'true', 
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setApplications(data.data);
        } else {
          dispatch(showToast({ message: data.error?.message || 'Failed to load applications', type: 'error' }));
        }
      } catch (err: any) {
        console.error('Error fetching seeker dashboard applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, dispatch]);

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>My Applications</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Track the status of your submitted job applications
        </p>
      </div>

      {loading ? (
        <div className="page-loader-wrapper">
          <div className="page-loader" />
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Applications Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You haven't submitted any job applications yet. Start browsing jobs to find your next career step!
          </p>
          <a href="/" className="btn btn-primary btn-sm">
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company / Employer</th>
                <th>Location</th>
                <th>Date Applied</th>
                <th>Resume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{app.job.title}</div>
                    <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px' }}>
                      {app.job.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {app.job.employer.email.split('@')[0]}
                    </span>
                  </td>
                  <td>{app.job.location}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    {/* View Resume link */}
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${app.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '500' }}
                    >
                      <FileText size={14} />
                      View Resume
                    </a>
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
