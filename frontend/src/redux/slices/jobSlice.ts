import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Job {
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

interface JobFilters {
  location: string;
  category: string;
  minSalary: string;
  maxSalary: string;
  search: string;
}

interface JobState {
  listings: Job[];
  activeFilters: JobFilters;
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  listings: [],
  activeFilters: {
    location: '',
    category: '',
    minSalary: '',
    maxSalary: '',
    search: '',
  },
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.listings = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<JobFilters>>) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.activeFilters = initialState.activeFilters;
    },
    setJobsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setJobsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setJobs, setFilters, resetFilters, setJobsLoading, setJobsError } = jobSlice.actions;
export default jobSlice.reducer;
