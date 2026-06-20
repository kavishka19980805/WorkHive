"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMatchScore = calculateMatchScore;
const COMMON_SKILLS = [
    'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'python', 'django', 'flask',
    'java', 'spring', 'c++', 'go', 'rust', 'ruby', 'rails', 'sql', 'postgresql', 'mongodb',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'typescript', 'javascript', 'html', 'css',
    'tailwind', 'git', 'ci/cd', 'agile', 'scrum', 'ui/ux', 'figma', 'product management',
    'marketing', 'seo', 'sales', 'devops', 'machine learning', 'ai', 'data science',
    'graphql', 'rest api', 'redux', 'flutter', 'react native', 'testing', 'jest', 'cypress'
];
function calculateMatchScore(jobDescription, resumeText) {
    if (!resumeText) {
        return {
            matchScore: 0,
            matchedSkills: [],
            missingSkills: [],
        };
    }
    const normalizedJobDesc = jobDescription.toLowerCase();
    const normalizedResumeText = resumeText.toLowerCase();
    // Find which common skills are mentioned in the job description
    const requiredSkills = COMMON_SKILLS.filter((skill) => {
        // Escape special characters for RegExp (e.g. c++, next.js)
        const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        // Match word boundaries or spaces, e.g. "react" in "react developer"
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        return regex.test(normalizedJobDesc);
    });
    if (requiredSkills.length === 0) {
        // If no specific skills are parsed in the job description, do a generic word overlap (Jaccard)
        const jobWords = new Set(normalizedJobDesc.match(/\b[a-z]{3,}\b/g) || []);
        const resumeWords = new Set(normalizedResumeText.match(/\b[a-z]{3,}\b/g) || []);
        const intersection = new Set([...jobWords].filter((x) => resumeWords.has(x)));
        const union = new Set([...jobWords, ...resumeWords]);
        const score = union.size === 0 ? 0 : Math.round((intersection.size / union.size) * 100);
        return {
            matchScore: score,
            matchedSkills: Array.from(intersection).slice(0, 5).map((w) => w.toUpperCase()),
            missingSkills: [],
        };
    }
    // Find which of the required skills are mentioned in the resume
    const matchedSkills = requiredSkills.filter((skill) => {
        const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        return regex.test(normalizedResumeText);
    });
    const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
    // Match score is the percentage of required skills present in the resume
    const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    // Capitalize skills for presentation
    const capitalize = (str) => {
        if (str === 'ui/ux')
            return 'UI/UX';
        if (str === 'aws')
            return 'AWS';
        if (str === 'gcp')
            return 'GCP';
        if (str === 'sql')
            return 'SQL';
        if (str === 'ci/cd')
            return 'CI/CD';
        if (str === 'seo')
            return 'SEO';
        if (str === 'rest api')
            return 'REST API';
        // Capitalize first letter
        return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };
    return {
        matchScore: score,
        matchedSkills: matchedSkills.map(capitalize),
        missingSkills: missingSkills.map(capitalize),
    };
}
