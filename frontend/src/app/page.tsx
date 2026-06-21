import React, { Suspense } from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import { MapPin, Briefcase, DollarSign, Calendar, UserPlus, BellRing, CheckSquare } from 'lucide-react';

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
}

const formatSalary = (min: number, max: number) => {
  const formatNum = (num: number) => {
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}k`;
    }
    return `$${num}`;
  };
  return `${formatNum(min)} - ${formatNum(max)}`;
};

async function getJobs(searchParams: any) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const query = new URLSearchParams();

  if (searchParams.search) query.append('search', searchParams.search);
  if (searchParams.location) query.append('location', searchParams.location);
  if (searchParams.category) query.append('category', searchParams.category);
  if (searchParams.minSalary) query.append('minSalary', searchParams.minSalary);

  try {
    const res = await fetch(`${backendUrl}/jobs?${query.toString()}`, { headers: { 'ngrok-skip-browser-warning': 'true' }, 
      cache: 'no-store', // Disable caching for SSR
    });

    if (!res.ok) throw new Error('Failed to fetch jobs');

    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Error fetching jobs for SSR:', err);
    return null;
  }
}

export default async function HomePage(props: {
  searchParams: Promise<{
    search?: string;
    location?: string;
    category?: string;
    minSalary?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const jobs: Job[] | null = await getJobs(searchParams);

  // Category counts and custom illustrations for mock listing
  const categoriesList = [
    { name: 'Engineering', count: '8 Open Jobs', image: '/images/cat_engineering.png' },
    { name: 'Design', count: '3 Open Jobs', image: '/images/cat_design.png' },
    { name: 'Product Management', count: '2 Open Jobs', image: '/images/cat_pm.png' },
    { name: 'Marketing', count: '3 Open Jobs', image: '/images/cat_sales.png' },
    { name: 'Sales', count: '4 Open Jobs', image: '/images/cat_sales.png' },
  ];

  return (
    <div>
      {/* 1. Jobenvoy Style Hero Banner Slider */}
      <Suspense fallback={<div className="hero-slider-container animate-pulse" style={{ height: '560px', background: '#0a2540' }} />}>
        <HeroSlider />
      </Suspense>

      <div className="container">


        {/* 3. Featured Jobs Section */}
        <section style={{ marginTop: '40px' }}>
          <h2 className="section-title">
            Featured <span>Jobs</span>
          </h2>

          {jobs === null ? (
            <div className="card" style={{ textAlign: 'center', borderColor: 'var(--danger)', background: 'var(--danger-glow)' }}>
              <h3 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Backend Offline</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Could not connect to the WorkHive API at <code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}</code>.
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <h3 style={{ marginBottom: '8px' }}>No Jobs Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                We couldn't find any job listings matching your filters.
              </p>
              <Link href="/" className="btn btn-secondary btn-sm">
                Reset All Filters
              </Link>
            </div>
          ) : (
            <div className="job-grid">
              {jobs.map((job) => (
                <div key={job.id} className="card">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-card-title">{job.title}</h3>
                      <div className="job-card-company">WorkHive Client Partner</div>
                    </div>
                    <span className="badge badge-indigo">{job.category}</span>
                  </div>

                  <div className="job-card-details">
                    <div className="job-card-detail-item">
                      <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{job.location}</span>
                    </div>
                    <div className="job-card-detail-item">
                      <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)} / yr</span>
                    </div>
                    <div className="job-card-detail-item">
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <span className="job-card-salary">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    <Link href={`/jobs/${job.id}`} className="btn btn-primary btn-sm" style={{ padding: '6px 16px', fontSize: '13px' }}>
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Find Your Jobs By Category Section */}
        <section style={{ marginTop: '80px' }}>
          <h2 className="section-title">
            Find Your Jobs By <span>Category</span>
          </h2>
          <div className="category-grid">
            {categoriesList.map((cat) => (
              <Link key={cat.name} href={`/?category=${cat.name}`} className="category-card">
                <div className="category-card-image-wrapper">
                  <img src={cat.image} alt={cat.name} className="category-card-image" />
                </div>
                <div className="category-card-info">
                  <h4>{cat.name}</h4>
                  <p>{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. How It Works Section */}
        <section style={{ marginTop: '80px' }}>
          <h2 className="section-title">
            How It <span>Works</span>
          </h2>
          <div className="how-it-works-grid">
            <div className="how-step">
              <div className="how-step-icon">
                <UserPlus size={28} />
              </div>
              <h3>Register an Account</h3>
              <p>Sign up as a jobseeker to reach out to the greatest Employers, Attach your own CV or build your CV on our system.</p>
            </div>

            <div className="how-step">
              <div className="how-step-icon">
                <BellRing size={28} />
              </div>
              <h3>Create Your Job Alert</h3>
              <p>Your Search History will automatically be your Job Alert Agent, sending you the most relevant jobs to your inbox.</p>
            </div>

            <div className="how-step">
              <div className="how-step-icon">
                <CheckSquare size={28} />
              </div>
              <h3>Apply for Jobs</h3>
              <p>Click to apply on the Job you have been waiting for and your CV will directly be recommended to the Employer.</p>
            </div>
          </div>
        </section>

        {/* 6. Top Companies Hiring Section */}
        <section style={{ marginTop: '80px', marginBottom: '20px' }}>
          <h2 className="section-title">
            Top Companies <span>Hiring</span>
          </h2>
          <div className="companies-grid">
            <div className="company-logo-placeholder">TechHive</div>
            <div className="company-logo-placeholder">ApexFinance</div>
            <div className="company-logo-placeholder">CloudScale</div>
            <div className="company-logo-placeholder">PixelPerfect</div>
            <div className="company-logo-placeholder">DesignCraft</div>
          </div>
        </section>

        {/* 7. Get Notified subscription banner */}
        <section className="subscribe-banner">
          <h2>Get Notified <span>Every New Job</span></h2>
          <p>Subscribe to our newsletter list to receive weekly alerts on active job postings matching your tech stack.</p>
          <div className="subscribe-input-group">
            <input type="email" placeholder="Enter your email address" />
            <button className="btn">Subscribe</button>
          </div>
        </section>
      </div>
    </div>
  );
}
