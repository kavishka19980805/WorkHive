import { PrismaClient, Role, JobStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create 5 Employers
  const employers = [];
  const employerCompanies = [
    'TechHive Solutions',
    'DesignCraft Studio',
    'Apex Finance Group',
    'CloudScale Systems',
    'PixelPerfect Labs',
  ];

  for (let i = 1; i <= 5; i++) {
    const email = `employer${i}@workhive.com`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.employer,
      },
    });
    employers.push({ ...user, companyName: employerCompanies[i - 1] });
  }

  // 2. Create 15 Seekers
  const seekers = [];
  const seekerNames = [
    'Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Evan Wright',
    'Fiona Gallagher', 'George Clark', 'Hannah Abbott', 'Ian Malcolm', 'Julia Roberts',
    'Kevin Bacon', 'Laura Croft', 'Michael Scott', 'Natalie Portman', 'Oliver Queen'
  ];

  for (let i = 1; i <= 15; i++) {
    const email = `seeker${i}@workhive.com`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.seeker,
      },
    });
    seekers.push({ ...user, name: seekerNames[i - 1] });
  }

  // 3. Create 1 Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@workhive.com',
      passwordHash,
      role: Role.admin,
    },
  });

  console.log(`Seeded users: 5 employers, 15 seekers, 1 admin.`);

  // 4. Create 20 Jobs
  const jobsData = [
    { title: 'Senior Software Engineer', category: 'Engineering', location: 'San Francisco, CA', salaryMin: 120000, salaryMax: 160000, status: JobStatus.active },
    { title: 'Frontend Developer (React)', category: 'Engineering', location: 'Remote', salaryMin: 80000, salaryMax: 110000, status: JobStatus.active },
    { title: 'Backend Engineer (Node.js)', category: 'Engineering', location: 'New York, NY', salaryMin: 100000, salaryMax: 140000, status: JobStatus.active },
    { title: 'Full Stack Engineer', category: 'Engineering', location: 'Austin, TX', salaryMin: 110000, salaryMax: 150000, status: JobStatus.active },
    { title: 'DevOps Specialist', category: 'Engineering', location: 'Remote', salaryMin: 115000, salaryMax: 145000, status: JobStatus.active },
    { title: 'UI/UX Designer', category: 'Design', location: 'San Francisco, CA', salaryMin: 90000, salaryMax: 125000, status: JobStatus.active },
    { title: 'Product Designer', category: 'Design', location: 'Remote', salaryMin: 95000, salaryMax: 130000, status: JobStatus.active },
    { title: 'Graphic Designer', category: 'Design', location: 'London, UK', salaryMin: 50000, salaryMax: 70000, status: JobStatus.active },
    { title: 'Senior Product Manager', category: 'Product Management', location: 'New York, NY', salaryMin: 130000, salaryMax: 170000, status: JobStatus.active },
    { title: 'Technical Product Manager', category: 'Product Management', location: 'Remote', salaryMin: 120000, salaryMax: 160000, status: JobStatus.active },
    { title: 'Growth Marketing Manager', category: 'Marketing', location: 'San Francisco, CA', salaryMin: 85000, salaryMax: 115000, status: JobStatus.active },
    { title: 'SEO Specialist', category: 'Marketing', location: 'Remote', salaryMin: 60000, salaryMax: 85000, status: JobStatus.active },
    { title: 'Content Strategist', category: 'Marketing', location: 'Austin, TX', salaryMin: 70000, salaryMax: 95000, status: JobStatus.active },
    { title: 'Sales Development Representative', category: 'Sales', location: 'Boston, MA', salaryMin: 50000, salaryMax: 75000, status: JobStatus.active },
    { title: 'Enterprise Account Executive', category: 'Sales', location: 'New York, NY', salaryMin: 100000, salaryMax: 150000, status: JobStatus.active },
    // Flagged and Removed Jobs for admin moderation check
    { title: 'Inappropriate Content Job', category: 'Sales', location: 'Remote', salaryMin: 200000, salaryMax: 300000, status: JobStatus.flagged },
    { title: 'Suspicious Cryptomining Offer', category: 'Engineering', location: 'Remote', salaryMin: 500000, salaryMax: 1000000, status: JobStatus.flagged },
    { title: 'Fake Job Listing', category: 'Marketing', location: 'Los Angeles, CA', salaryMin: 30000, salaryMax: 40000, status: JobStatus.removed },
    { title: 'Spam Marketing Job', category: 'Marketing', location: 'Chicago, IL', salaryMin: 20000, salaryMax: 25000, status: JobStatus.removed },
    { title: 'Mobile Developer (Flutter)', category: 'Engineering', location: 'Austin, TX', salaryMin: 95000, salaryMax: 130000, status: JobStatus.active }
  ];

  const jobs = [];
  for (let i = 0; i < jobsData.length; i++) {
    const jobInfo = jobsData[i];
    // Cycle through employers
    const employer = employers[i % employers.length];
    const job = await prisma.job.create({
      data: {
        title: jobInfo.title,
        description: `This is a premium opportunity to join ${employer.companyName} as a ${jobInfo.title}. We are looking for highly motivated individuals who want to excel in their field. Excellent benefit packages and flexible hours.`,
        location: jobInfo.location,
        category: jobInfo.category,
        salaryMin: jobInfo.salaryMin,
        salaryMax: jobInfo.salaryMax,
        status: jobInfo.status,
        employerId: employer.id,
      },
    });
    jobs.push(job);
  }
  console.log(`Seeded jobs: ${jobs.length} jobs created.`);

  // 5. Create 30 Applications with varied statuses
  const applicationStatuses = [
    ApplicationStatus.pending,
    ApplicationStatus.accepted,
    ApplicationStatus.rejected
  ];

  const coverLetters = [
    "I am very excited about this opportunity and believe my skill set matches perfectly. I have over 3 years of hands-on experience in building performant systems and collaborating with cross-functional teams.",
    "Please find my resume attached. I would love to discuss how my experience fits this role. I have extensive experience in this industry and am keen to contribute from day one.",
    "Hi Hiring Team, I am writing to express my strong interest in this position. With a solid track-record of delivering high-quality results, I am confident I will be a valuable addition to your team.",
    "Having worked on similar projects in the past, I am confident I can make an immediate impact. I hope to hear from you soon.",
    "Dear Employer, this role aligns perfectly with my career goals. I have developed a strong foundation in this field and look forward to discussing my application in detail."
  ];

  let appCount = 0;
  for (let i = 0; i < 30; i++) {
    const seeker = seekers[i % seekers.length];
    // Find active jobs first, fallback to any job if needed
    const activeJobs = jobs.filter(j => j.status === JobStatus.active);
    const job = activeJobs[i % activeJobs.length];
    
    // Ensure seeker doesn't apply to the same job twice
    const existing = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        userId: seeker.id
      }
    });

    if (existing) {
      continue;
    }

    const status = applicationStatuses[i % applicationStatuses.length];
    const coverLetter = coverLetters[i % coverLetters.length];
    const resumeUrl = `/uploads/resumes/resume_${seeker.id}.pdf`;
    const resumeText = `RESUME OF ${seeker.name.toUpperCase()}\nEmail: ${seeker.email}\nExperience: 4 years in software and product development. Technical stack: Node.js, React, SQL, TypeScript.\nEducation: BSc in Computer Science.`;

    await prisma.application.create({
      data: {
        jobId: job.id,
        userId: seeker.id,
        status,
        coverLetter,
        resumeUrl,
        resumeText,
      },
    });
    appCount++;
  }

  console.log(`Seeded applications: ${appCount} applications created.`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
