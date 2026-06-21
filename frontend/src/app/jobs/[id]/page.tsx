import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft, Send } from 'lucide-react';

interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  category: string;
  salaryMin: number;
  salaryMax: number;
  status: 'active' | 'flagged' | 'removed';
  createdAt: string;
  employer: {
    email: string;
  };
}

const formatSalary = (min: number, max: number) => {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

async function getJobDetails(id: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  try {
    const res = await fetch(`${backendUrl}/jobs/${id}`, { headers: { 'ngrok-skip-browser-warning': 'true' }, 
      cache: 'no-store', // Disable caching for SSR
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error('Error fetching job detail:', err);
    return null;
  }
}

export default async function JobDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const job: Job | null = await getJobDetails(params.id);
  const session = await getServerSession(authOptions);

  if (!job) {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <Link href="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '8px', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Job Listings
        </Link>
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3>Job Not Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            The job listing you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  const canApply = !session || userRole === 'seeker';

  return (
    <div className="container">
      <Link href="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Job Listings
      </Link>

      <div className="job-detail-grid">
        {/* Main Details */}
        <div className="job-detail-main">
          <span className="badge badge-indigo" style={{ marginBottom: '16px' }}>{job.category}</span>
          <h1 className="job-detail-title">{job.title}</h1>
          
          <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '18px', marginBottom: '16px' }}>
            Posted by {job.employer?.email.split('@')[0]}
          </div>

          <div className="job-detail-meta">
            <div className="job-card-detail-item">
              <MapPin size={18} />
              <span>{job.location}</span>
            </div>
            <div className="job-card-detail-item">
              <DollarSign size={18} />
              <span>{formatSalary(job.salaryMin, job.salaryMax)} / yr</span>
            </div>
            <div className="job-card-detail-item">
              <Calendar size={18} />
              <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Job Description</h2>
          <div className="job-detail-description">
            {job.description}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="job-detail-sidebar">
          <h2 className="job-detail-sidebar-title">Job Overview</h2>

          <div className="job-detail-info-row">
            <div className="job-detail-info-label">Category</div>
            <div className="job-detail-info-value">{job.category}</div>
          </div>

          <div className="job-detail-info-row">
            <div className="job-detail-info-label">Location Type</div>
            <div className="job-detail-info-value">{job.location}</div>
          </div>

          <div className="job-detail-info-row">
            <div className="job-detail-info-label">Salary Range</div>
            <div className="job-detail-info-value">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            {canApply ? (
              <Link href={`/apply/${job.id}`} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
                <Send size={18} />
                Apply Now
              </Link>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <button className="btn btn-secondary" style={{ width: '100%', cursor: 'not-allowed', opacity: '0.6' }} disabled>
                  Applications Restricted
                </button>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Only job seekers can apply. You are logged in as {userRole}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
