'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Helper to get session and token
async function getAuthHeader() {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!token) {
    throw new Error('Not authenticated');
  }
  return `Bearer ${token}`;
}

/**
 * Server Action: Submit Application and Upload Resume
 */
export async function applyAction(formData: FormData) {
  try {
    const authHeader = await getAuthHeader();
    const jobId = formData.get('jobId') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const resumeFile = formData.get('resume') as File;

    if (!jobId || !coverLetter || !resumeFile) {
      return { success: false, error: 'All fields are required' };
    }

    if (resumeFile.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF resumes are allowed' };
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Resume file size exceeds 5MB limit' };
    }

    // 1. Upload PDF file to local backend
    const uploadFormData = new FormData();
    uploadFormData.append('resume', resumeFile);

    const uploadRes = await fetch(`${BACKEND_URL}/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: uploadFormData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.success) {
      return {
        success: false,
        error: uploadData?.error?.message || 'Resume upload failed',
      };
    }

    const resumeUrl = uploadData.data.resumeUrl;

    // 2. Submit application with the uploaded resume URL
    const appRes = await fetch(`${BACKEND_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        jobId,
        coverLetter,
        resumeUrl,
      }),
    });

    const appData = await appRes.json();
    if (!appRes.ok || !appData.success) {
      return {
        success: false,
        error: appData?.error?.message || 'Application submission failed',
      };
    }

    return { success: true, data: appData.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server connection error' };
  }
}

/**
 * Server Action: Create new job posting
 */
export async function postJobAction(jobData: {
  title: string;
  description: string;
  location: string;
  category: string;
  salaryMin: number;
  salaryMax: number;
}) {
  try {
    const authHeader = await getAuthHeader();

    const res = await fetch(`${BACKEND_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(jobData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.error?.message || 'Failed to create job posting',
      };
    }

    return { success: true, data: data.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server connection error' };
  }
}

/**
 * Server Action: Accept/Reject Seeker Application
 */
export async function updateApplicantAction(applicationId: string, status: 'accepted' | 'rejected') {
  try {
    const authHeader = await getAuthHeader();

    const res = await fetch(`${BACKEND_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data?.error?.message || 'Failed to update applicant status',
      };
    }

    return { success: true, data: data.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server connection error' };
  }
}
