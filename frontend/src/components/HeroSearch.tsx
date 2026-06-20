'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, Briefcase, DollarSign } from 'lucide-react';

const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK', 'Remote', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA'];
const CATEGORIES = ['Engineering', 'Design', 'Product Management', 'Marketing', 'Sales'];

export default function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Sync inputs with URL changes (e.g. pill clicks)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setLocation(searchParams.get('location') || '');
    setCategory(searchParams.get('category') || '');
    setMinSalary(searchParams.get('minSalary') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    if (location) {
      params.set('location', location);
    } else {
      params.delete('location');
    }

    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    if (minSalary) {
      params.set('minSalary', minSalary);
    } else {
      params.delete('minSalary');
    }

    router.push(`/?${params.toString()}`);
    setShowFilters(false);
  };

  return (
    <form onSubmit={handleSearch} className="hero-search-container" style={{ position: 'relative' }}>
      <div className="hero-search-input-group">
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Job title, keywords, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="hero-search-divider" />

      <div className="hero-search-input-group">
        <MapPin size={20} style={{ color: 'var(--text-muted)' }} />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Glassmorphic Filter Settings Toggle Button */}
      <button
        type="button"
        className={`hero-filter-trigger ${showFilters || category || minSalary ? 'active' : ''}`}
        onClick={() => setShowFilters(!showFilters)}
        title="More Filters"
      >
        <SlidersHorizontal size={18} />
      </button>

      <button type="submit" className="hero-search-btn">
        Search Jobs
      </button>

      {/* Advanced Popover filters */}
      {showFilters && (
        <div className="hero-search-filters-popover">
          <div className="popover-row">
            <div className="popover-field">
              <label className="popover-label">
                <Briefcase size={14} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                Category
              </label>
              <div className="popover-select-wrapper">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="popover-select"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="popover-field">
              <label className="popover-label">
                <DollarSign size={14} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                Min Salary
              </label>
              <div className="popover-select-wrapper">
                <select 
                  value={minSalary} 
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="popover-select"
                >
                  <option value="">Min Salary (Any)</option>
                  <option value="50000">$50,000 / yr +</option>
                  <option value="80000">$80,000 / yr +</option>
                  <option value="100000">$100,000 / yr +</option>
                  <option value="120000">$120,000 / yr +</option>
                  <option value="150000">$150,000 / yr +</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
