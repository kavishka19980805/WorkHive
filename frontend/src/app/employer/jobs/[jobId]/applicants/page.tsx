'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { showToast } from '@/redux/slices/uiSlice';
import { updateApplicantAction } from '@/app/actions';
import { FileText, ArrowLeft, Check, X, Calendar, Loader, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Applicant {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl: string;
  resumeText: string | null;
  appliedAt: string;
  user: {
    email: string;
  };
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const jobId = params.jobId as string;
  const token = useSelector((state: RootState) => state.auth.token);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState('Job Posting');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // State to track which resumes are expanded for viewing plain-text
  const [expandedResumeId, setExpandedResumeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicantsAndJob = async () => {
      if (!token || !jobId) return;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      try {
        // Fetch Job Title
        const jobRes = await fetch(`${backendUrl}/jobs/${jobId}`, { headers: { 'ngrok-skip-browser-warning': 'true', 'ngrok-skip-browser-warning': 'true' } });
        const jobData = await jobRes.json();
        if (jobData.success) {
          setJobTitle(jobData.data.title);
        }

        // Fetch Applicants
        const appRes = await fetch(`${backendUrl}/jobs/${jobId}/applicants`, { headers: { 'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${token}`,
          },
        });

        const appData = await appRes.json();
        if (appData.success) {
          setApplicants(appData.data);
        } else {
          dispatch(showToast({ message: appData.error?.message || 'Failed to load applicants', type: 'error' }));
        }
      } catch (err: any) {
        console.error('Error fetching applicants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantsAndJob();
  }, [token, jobId, dispatch]);

  const handleStatusChange = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setActionLoadingId(applicationId);
    try {
      // Trigger Next.js Server Action
      const res = await updateApplicantAction(applicationId, status);

      if (!res.success) {
        dispatch(showToast({ message: res.error || 'Failed to update status', type: 'error' }));
      } else {
        dispatch(
          showToast({
            message: `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`,
            type: 'success',
          })
        );
        // Update local state
        setApplicants((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
        );
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Something went wrong', type: 'error' }));
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleResumeExpand = (id: string) => {
    if (expandedResumeId === id) {
      setExpandedResumeId(null);
    } else {
      setExpandedResumeId(id);
    }
  };

  return (
    <div className="container">
      <Link href="/employer/jobs" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to My Postings
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Job Applicants</h1>
        <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '4px' }}>{jobTitle}</p>
      </div>

      {loading ? (
        <div className="page-loader-wrapper">
          <div className="page-loader" />
        </div>
      ) : applicants.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <h3>No Applicants Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            No seekers have applied for this job listing yet. Keep an eye out!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {applicants.map((app) => (
            <div key={app.id} className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                    {app.user.email.split('@')[0]}
                    {app.matchScore !== undefined && (
                      <span
                        className={`badge ${
                          app.matchScore >= 75
                            ? 'badge-emerald'
                            : app.matchScore >= 50
                            ? 'badge-amber'
                            : 'badge-rose'
                        }`}
                        style={{ marginLeft: '12px', fontSize: '11px', textTransform: 'none' }}
                      >
                        {app.matchScore}% Match
                      </span>
                    )}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
                    Email: {app.user.email}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Calendar size={12} />
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>

                  {app.matchScore !== undefined && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      {app.matchedSkills && app.matchedSkills.length > 0 && (
                        <div>
                          <span style={{ color: 'var(--success)', fontWeight: '600' }}>Matched Skills: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{app.matchedSkills.join(', ')}</span>
                        </div>
                      )}
                      {app.missingSkills && app.missingSkills.length > 0 && (
                        <div>
                          <span style={{ color: 'var(--danger)', fontWeight: '600' }}>Missing Skills: </span>
                          <span style={{ color: 'var(--text-secondary)' }}>{app.missingSkills.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(app.id, 'accepted')}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'var(--success)', color: '#ffffff', gap: '6px' }}
                        disabled={actionLoadingId === app.id}
                      >
                        {actionLoadingId === app.id ? (
                          <Loader size={14} className="loader" />
                        ) : (
                          <Check size={14} />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                        className="btn btn-danger btn-sm"
                        style={{ gap: '6px' }}
                        disabled={actionLoadingId === app.id}
                      >
                        {actionLoadingId === app.id ? (
                          <Loader size={14} className="loader" />
                        ) : (
                          <X size={14} />
                        )}
                        Reject
                      </button>
                    </>
                  ) : (
                    <div style={{ textTransform: 'capitalize', fontWeight: '700' }}>
                      Status:{' '}
                      <span className={app.status === 'accepted' ? 'badge badge-emerald' : 'badge badge-rose'}>
                        {app.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter Section */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '6px' }}>Cover Letter</h4>
                <p style={{ fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                  {app.coverLetter}
                </p>
              </div>

              {/* Resume Actions */}
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${app.resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <FileText size={14} />
                  Download PDF Resume
                </a>

                {app.resumeText && (
                  <button
                    onClick={() => toggleResumeExpand(app.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Eye size={14} />
                    {expandedResumeId === app.id ? (
                      <>
                        Hide Extracted Text <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        View Extracted Text (AI Resume) <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Extracted Resume Text panel (Resume Parser worker output!) */}
              {expandedResumeId === app.id && app.resumeText && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '20px',
                    background: '#04070d',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-hover)',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-secondary)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {app.resumeText}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
