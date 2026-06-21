'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { showToast } from '@/redux/slices/uiSlice';
import { postJobAction } from '@/app/actions';
import { Briefcase, MapPin, DollarSign, Send, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Engineering', 'Design', 'Product Management', 'Marketing', 'Sales'];
const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK', 'Remote', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA'];

export default function PostJobPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [description, setDescription] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title) newErrors.title = 'Title is required';
    if (!description || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    const min = parseInt(salaryMin);
    const max = parseInt(salaryMax);
    if (isNaN(min) || min < 0) {
      newErrors.salaryMin = 'Minimum salary must be a positive number';
    }
    if (isNaN(max) || max < 0) {
      newErrors.salaryMax = 'Maximum salary must be a positive number';
    }
    if (!isNaN(min) && !isNaN(max) && min > max) {
      newErrors.salaryMin = 'Minimum salary cannot exceed maximum salary';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      // Trigger Next.js Server Action
      const res = await postJobAction({
        title,
        description,
        location,
        category,
        salaryMin: parseInt(salaryMin),
        salaryMax: parseInt(salaryMax),
      });

      if (!res.success) {
        dispatch(showToast({ message: res.error || 'Failed to post job', type: 'error' }));
      } else {
        dispatch(showToast({ message: 'Job posting published successfully!', type: 'success' }));
        window.location.href = '/employer/jobs';
      }
    } catch (err: any) {
      dispatch(showToast({ message: err.message || 'Something went wrong', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Link href="/employer/jobs" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to My Postings
      </Link>

      <div className="auth-container card" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div className="auth-header">
          <h1>Post a New Job</h1>
          <p>Create a job listing to find your next great hire</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Senior Full Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <select
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea
              className="form-control"
              placeholder="Detail the roles, responsibilities, requirements, and benefits for this position..."
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Minimum Salary ($ / yr)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 80000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
              {errors.salaryMin && <span className="form-error">{errors.salaryMin}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Salary ($ / yr)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 120000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
              {errors.salaryMax && <span className="form-error">{errors.salaryMax}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px', gap: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="loader" />
                Publishing Listing...
              </>
            ) : (
              <>
                <Send size={16} />
                Publish Job Posting
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
