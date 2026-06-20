'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Briefcase, DollarSign } from 'lucide-react';

const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK', 'Remote', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA'];
const CATEGORIES = ['Engineering', 'Design', 'Product Management', 'Marketing', 'Sales'];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');

  // Debounced search text
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      updateUrl({ search });
    }, 300); // 300ms debounce time

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Update URL parameters
  const updateUrl = (updatedFields: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Combine existing state and newly updated fields
    const current = {
      search,
      location,
      category,
      minSalary,
      ...updatedFields,
    };

    Object.entries(current).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    router.push(`/?${params.toString()}`);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocation(val);
    updateUrl({ location: val });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    updateUrl({ category: val });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setMinSalary(val);
    updateUrl({ minSalary: val });
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setMinSalary('');
    router.push('/');
  };

  const hasFilters = search || location || category || minSalary;

  return (
    <div className="filter-bar">
      <div className="filter-row-top">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="form-control search-control"
            placeholder="Search job titles or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-row-bottom">
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <MapPin size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <select
            className="form-control"
            style={{ paddingLeft: '38px', appearance: 'none', cursor: 'pointer' }}
            value={location}
            onChange={handleLocationChange}
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Briefcase size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <select
            className="form-control"
            style={{ paddingLeft: '38px', appearance: 'none', cursor: 'pointer' }}
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <DollarSign size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <select
            className="form-control"
            style={{ paddingLeft: '38px', appearance: 'none', cursor: 'pointer' }}
            value={minSalary}
            onChange={handleSalaryChange}
          >
            <option value="">Min Salary (Any)</option>
            <option value="50000">$50,000 / yr +</option>
            <option value="80000">$80,000 / yr +</option>
            <option value="100000">$100,000 / yr +</option>
            <option value="120000">$120,000 / yr +</option>
            <option value="150000">$150,000 / yr +</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="btn btn-secondary btn-sm"
            style={{ height: '48px', justifySelf: 'center', width: '100%' }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
