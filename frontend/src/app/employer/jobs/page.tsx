'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { showToast } from '@/redux/slices/uiSlice';
import { Users, Calendar, PlusCircle, AlertCircle } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  location: string;
  category: string;
  salaryMin: number;
  salaryMax: number;
  status: 'active' | 'flagged' | 'removed';
  createdAt: string;
}

export default function EmployerJobsPage() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) return;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      try {
        const res = await fetch(`${backendUrl}/employer/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        } else {
          dispatch(showToast({ message: data.error?.message || 'Failed to load jobs', type: 'error' }));
        }
      } catch (err: any) {
        console.error('Error fetching employer jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token, dispatch]);

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-emerald">Active</span>;
      case 'flagged':
        return (
          <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> Flagged
          </span>
        );
      case 'removed':
        return <span className="badge badge-rose">Removed</span>;
      default:
        return <span className="badge badge-rose">{status}</span>;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>My Posted Jobs</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage your published job listings and track applicants
          </p>
        </div>
        <Link href="/employer/post" className="btn btn-primary" style={{ gap: '8px' }}>
          <PlusCircle size={18} />
          Post New Job
        </Link>
      </div>

      {loading ? (
        <div className="page-loader-wrapper">
          <div className="page-loader" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h3>No Job Postings Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', marginTop: '8px' }}>
            You haven't posted any job listings yet. Create your first posting to start receiving applications!
          </p>
          <Link href="/employer/post" className="btn btn-primary btn-sm">
            Post a Job Now
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job Details</th>
                <th>Location</th>
                <th>Salary Range</th>
                <th>Date Posted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.title}</div>
                    <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px' }}>
                      {job.category}
                    </span>
                  </td>
                  <td>{job.location}</td>
                  <td>
                    ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / yr
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{getStatusBadge(job.status)}</td>
                  <td>
                    <Link
                      href={`/employer/jobs/${job.id}/applicants`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Users size={14} />
                      View Applicants
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
