'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { showToast } from '@/redux/slices/uiSlice';
import { applyAction } from '@/app/actions';
import { FileText, UploadCloud, Send, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const jobId = params.jobId as string;

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobTitle, setJobTitle] = useState('Job Posting');

  // Fetch job details to display the job title on the apply form
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${backendUrl}/jobs/${jobId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const data = await res.json();
        if (data.success) {
          setJobTitle(data.data.title);
        }
      } catch (err) {
        console.error('Error fetching job details for apply form:', err);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Only PDF resumes are accepted');
        setResumeFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter || coverLetter.length < 10) {
      setError('Cover letter must be at least 10 characters');
      return;
    }
    if (!resumeFile) {
      setError('Please upload your resume PDF');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('coverLetter', coverLetter);
    formData.append('resume', resumeFile);

    try {
      // Trigger Next.js Server Action
      const res = await applyAction(formData);

      if (!res.success) {
        setError(res.error || 'Failed to submit application');
        dispatch(showToast({ message: res.error || 'Submission failed', type: 'error' }));
      } else {
        dispatch(
          showToast({
            message: `Applied successfully for ${jobTitle}!`,
            type: 'success',
          })
        );
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Link href={`/jobs/${jobId}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Job Details
      </Link>

      <div className="auth-container card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div className="auth-header">
          <h1>Submit Application</h1>
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '4px' }}>{jobTitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="card" style={{ padding: '12px 16px', borderColor: 'var(--danger)', background: 'var(--danger-glow)', marginBottom: '20px', fontSize: '14px', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Cover Letter</label>
            <textarea
              className="form-control"
              placeholder="Introduce yourself to the employer and explain why you are a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resume PDF (Max 5MB)</label>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-primary)',
                transition: 'var(--transition)',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <UploadCloud size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              {resumeFile ? (
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FileText size={16} />
                    {resumeFile.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • PDF file selected
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: '500' }}>Click or drag a PDF file to upload</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Only PDF files are supported
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', gap: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="loader" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
