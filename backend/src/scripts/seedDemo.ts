/**
 * Demo Seed Script — Inserts a pre-computed "Full Stack Engineer" scan into Supabase.
 *
 * Usage:
 *   npx ts-node src/scripts/seedDemo.ts --user-id=YOUR_USER_ID
 *
 * Demo Account Checklist:
 * - [ ] Create demo account (sign up via the app or Supabase dashboard)
 * - [ ] Note user_id from Supabase Auth → Users table
 * - [ ] Run this seed script with that user_id
 * - [ ] Verify dashboard shows seeded data
 * - [ ] Test chat against seeded scan
 * - [ ] Optionally run one real scan alongside seeded data
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Parse --user-id from CLI args
function getUserId(): string {
  const arg = process.argv.find((a) => a.startsWith('--user-id='));
  if (!arg) {
    console.error('Usage: npx ts-node src/scripts/seedDemo.ts --user-id=USER_ID');
    process.exit(1);
  }
  return arg.split('=')[1];
}

async function seed() {
  const userId = getUserId();
  const scanId = crypto.randomUUID();

  const targetSkills = {
    role: 'Full Stack Engineer',
    role_category: 'software_engineering',
    required_skills: [
      { name: 'TypeScript', importance: 'critical', category: 'language', typical_evidence: 'TypeScript projects with strict mode enabled' },
      { name: 'React', importance: 'critical', category: 'framework', typical_evidence: 'React apps with hooks, context, and component composition' },
      { name: 'Node.js', importance: 'critical', category: 'framework', typical_evidence: 'Express/Fastify APIs with middleware patterns' },
      { name: 'PostgreSQL', importance: 'critical', category: 'tool', typical_evidence: 'Schema design, migrations, complex queries' },
      { name: 'REST API Design', importance: 'critical', category: 'concept', typical_evidence: 'Well-structured endpoints with proper HTTP methods and status codes' },
      { name: 'Git', importance: 'important', category: 'tool', typical_evidence: 'Clean commit history, branching strategies' },
      { name: 'Docker', importance: 'important', category: 'tool', typical_evidence: 'Dockerfiles, docker-compose for local dev' },
      { name: 'CI/CD', importance: 'important', category: 'concept', typical_evidence: 'GitHub Actions or similar pipeline configs' },
      { name: 'Testing', importance: 'important', category: 'concept', typical_evidence: 'Unit tests, integration tests, good coverage' },
      { name: 'Next.js', importance: 'important', category: 'framework', typical_evidence: 'SSR/SSG apps with API routes' },
      { name: 'Redis', importance: 'important', category: 'tool', typical_evidence: 'Caching layer or session management' },
      { name: 'GraphQL', importance: 'nice_to_have', category: 'concept', typical_evidence: 'Schema definitions, resolvers' },
      { name: 'AWS', importance: 'nice_to_have', category: 'platform', typical_evidence: 'S3, Lambda, EC2 usage in projects' },
      { name: 'Tailwind CSS', importance: 'nice_to_have', category: 'framework', typical_evidence: 'Utility-first styling in frontend projects' },
      { name: 'WebSockets', importance: 'nice_to_have', category: 'concept', typical_evidence: 'Real-time features using Socket.io or native WS' },
      { name: 'Kubernetes', importance: 'nice_to_have', category: 'platform', typical_evidence: 'K8s manifests, Helm charts' },
    ],
  };

  const evidenceScores = [
    {
      skill_name: 'TypeScript',
      importance: 'critical',
      evidence_score: 88,
      cross_reference: { resume: true, linkedin: true, github: true, status: 'verified' },
      breakdown: { language_match: 23, structure_match: 18, code_quality: 17, readme_quality: 8, linkedin_corroboration: 22 },
      details: 'Strong TypeScript usage across 6 repos with strict mode. Endorsed on LinkedIn. Listed on resume.',
    },
    {
      skill_name: 'React',
      importance: 'critical',
      evidence_score: 82,
      cross_reference: { resume: true, linkedin: true, github: true, status: 'verified' },
      breakdown: { language_match: 22, structure_match: 17, code_quality: 16, readme_quality: 7, linkedin_corroboration: 20 },
      details: 'Multiple React projects with hooks, context API. Component architecture is solid.',
    },
    {
      skill_name: 'Node.js',
      importance: 'critical',
      evidence_score: 75,
      cross_reference: { resume: true, linkedin: true, github: true, status: 'verified' },
      breakdown: { language_match: 20, structure_match: 16, code_quality: 14, readme_quality: 6, linkedin_corroboration: 19 },
      details: 'Express APIs in 4 repos. Middleware patterns used. Some error handling gaps.',
    },
    {
      skill_name: 'PostgreSQL',
      importance: 'critical',
      evidence_score: 52,
      cross_reference: { resume: true, linkedin: false, github: true, status: 'partial' },
      breakdown: { language_match: 15, structure_match: 12, code_quality: 10, readme_quality: 5, linkedin_corroboration: 10 },
      details: 'Used in 2 projects with basic schema design. No complex queries or migrations found.',
    },
    {
      skill_name: 'REST API Design',
      importance: 'critical',
      evidence_score: 68,
      cross_reference: { resume: true, linkedin: false, github: true, status: 'partial' },
      breakdown: { language_match: 18, structure_match: 15, code_quality: 13, readme_quality: 7, linkedin_corroboration: 15 },
      details: 'RESTful patterns in Express APIs. Proper HTTP methods used, but inconsistent status codes.',
    },
    {
      skill_name: 'Git',
      importance: 'important',
      evidence_score: 85,
      cross_reference: { resume: true, linkedin: true, github: true, status: 'verified' },
      breakdown: { language_match: 22, structure_match: 19, code_quality: 16, readme_quality: 8, linkedin_corroboration: 20 },
      details: 'Clean commit history, meaningful messages, feature branches visible across repos.',
    },
    {
      skill_name: 'Docker',
      importance: 'important',
      evidence_score: 45,
      cross_reference: { resume: true, linkedin: false, github: true, status: 'partial' },
      breakdown: { language_match: 12, structure_match: 10, code_quality: 8, readme_quality: 5, linkedin_corroboration: 10 },
      details: 'Dockerfiles found in 2 repos but no multi-stage builds or docker-compose.',
    },
    {
      skill_name: 'CI/CD',
      importance: 'important',
      evidence_score: 28,
      cross_reference: { resume: true, linkedin: false, github: false, status: 'claimed_only' },
      breakdown: { language_match: 5, structure_match: 8, code_quality: 0, readme_quality: 3, linkedin_corroboration: 12 },
      details: 'Mentioned on resume but no GitHub Actions or pipeline configs found in any repo.',
    },
    {
      skill_name: 'Testing',
      importance: 'important',
      evidence_score: 22,
      cross_reference: { resume: true, linkedin: false, github: false, status: 'claimed_only' },
      breakdown: { language_match: 5, structure_match: 5, code_quality: 2, readme_quality: 2, linkedin_corroboration: 8 },
      details: 'No test files or test directories found. Listed on resume under skills.',
    },
    {
      skill_name: 'Next.js',
      importance: 'important',
      evidence_score: 62,
      cross_reference: { resume: true, linkedin: true, github: true, status: 'verified' },
      breakdown: { language_match: 17, structure_match: 14, code_quality: 12, readme_quality: 5, linkedin_corroboration: 14 },
      details: 'One Next.js project with SSR. App router used. Basic API routes present.',
    },
    {
      skill_name: 'Redis',
      importance: 'important',
      evidence_score: 10,
      cross_reference: { resume: false, linkedin: false, github: false, status: 'not_found' },
      breakdown: { language_match: 0, structure_match: 5, code_quality: 0, readme_quality: 0, linkedin_corroboration: 5 },
      details: 'Mentioned in one README as a planned feature but no actual implementation.',
    },
    {
      skill_name: 'GraphQL',
      importance: 'nice_to_have',
      evidence_score: 0,
      cross_reference: { resume: false, linkedin: false, github: false, status: 'not_found' },
      breakdown: { language_match: 0, structure_match: 0, code_quality: 0, readme_quality: 0, linkedin_corroboration: 0 },
      details: 'No evidence found across any source.',
    },
    {
      skill_name: 'AWS',
      importance: 'nice_to_have',
      evidence_score: 35,
      cross_reference: { resume: true, linkedin: false, github: false, status: 'claimed_only' },
      breakdown: { language_match: 5, structure_match: 8, code_quality: 0, readme_quality: 7, linkedin_corroboration: 15 },
      details: 'Deployment mentioned in READMEs. Resume lists AWS. No IaC or SDK usage in code.',
    },
    {
      skill_name: 'Tailwind CSS',
      importance: 'nice_to_have',
      evidence_score: 72,
      cross_reference: { resume: true, linkedin: false, github: true, status: 'partial' },
      breakdown: { language_match: 18, structure_match: 16, code_quality: 14, readme_quality: 6, linkedin_corroboration: 18 },
      details: 'Tailwind used in 3 frontend projects with custom config. Responsive design patterns.',
    },
    {
      skill_name: 'WebSockets',
      importance: 'nice_to_have',
      evidence_score: 18,
      cross_reference: { resume: false, linkedin: false, github: true, status: 'partial' },
      breakdown: { language_match: 5, structure_match: 5, code_quality: 3, readme_quality: 2, linkedin_corroboration: 3 },
      details: 'Basic Socket.io setup in one chat app project. Minimal implementation.',
    },
    {
      skill_name: 'Kubernetes',
      importance: 'nice_to_have',
      evidence_score: 0,
      cross_reference: { resume: false, linkedin: false, github: false, status: 'not_found' },
      breakdown: { language_match: 0, structure_match: 0, code_quality: 0, readme_quality: 0, linkedin_corroboration: 0 },
      details: 'No evidence found across any source.',
    },
  ];

  const conflicts = [
    {
      skill: 'CI/CD',
      issue: 'Resume claims CI/CD experience but no pipeline configurations found in any GitHub repository.',
      risk_level: 'high',
      action: 'Add GitHub Actions workflows to at least 2 projects — a basic lint/test/build pipeline is sufficient.',
    },
    {
      skill: 'Testing',
      issue: 'Resume lists testing skills but zero test files exist across all public repos.',
      risk_level: 'high',
      action: 'Add unit tests to your top 2 projects. Even 10-15 meaningful tests dramatically improve credibility.',
    },
    {
      skill: 'AWS',
      issue: 'Resume mentions AWS but no infrastructure code or SDK usage found on GitHub.',
      risk_level: 'medium',
      action: 'Deploy one project with AWS (e.g., S3 for static hosting, Lambda for a function) and include the configuration in the repo.',
    },
  ];

  const hiddenSkills = [
    {
      skill: 'Responsive Design',
      found_on: ['github'],
      action: 'Add "Responsive Design" to your resume skills section — your GitHub projects demonstrate strong mobile-first patterns.',
    },
    {
      skill: 'API Documentation',
      found_on: ['github'],
      action: 'Your READMEs contain solid API endpoint documentation. Consider adding this as a skill or mentioning it in experience bullets.',
    },
    {
      skill: 'Monorepo Management',
      found_on: ['github'],
      action: 'Your turborepo setup shows monorepo experience — add this to your resume, it\'s a sought-after skill.',
    },
  ];

  const projects = [
    {
      title: 'Full-Stack Task Manager with Real-Time Updates',
      description: 'Build a collaborative task management app with real-time updates, authentication, and CI/CD pipeline. This single project addresses your biggest evidence gaps: testing, CI/CD, and WebSockets.',
      tech_stack: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Socket.io', 'Docker', 'GitHub Actions'],
      skills_covered: ['Testing', 'CI/CD', 'Redis', 'WebSockets', 'Docker'],
      estimated_hours: 30,
      difficulty: 'intermediate' as const,
      github_checklist: [
        'Set up Next.js frontend with TypeScript strict mode',
        'Build Express API with JWT auth and PostgreSQL',
        'Add Redis for caching and session management',
        'Implement WebSocket layer for real-time task updates',
        'Write 20+ unit tests and 5+ integration tests using Jest',
        'Create GitHub Actions CI pipeline (lint → test → build)',
        'Add Dockerfile and docker-compose.yml',
        'Write comprehensive README with setup instructions and screenshots',
      ],
      evidence_impact: 'Fills 5 skill gaps simultaneously. Expected to raise readiness from 42% to ~65%.',
    },
    {
      title: 'GraphQL API Gateway',
      description: 'Build a GraphQL gateway that aggregates data from multiple REST APIs. Demonstrates API design depth and introduces GraphQL to your portfolio.',
      tech_stack: ['TypeScript', 'Apollo Server', 'GraphQL', 'Node.js', 'Docker'],
      skills_covered: ['GraphQL', 'REST API Design', 'Docker', 'Testing'],
      estimated_hours: 18,
      difficulty: 'intermediate' as const,
      github_checklist: [
        'Design GraphQL schema with types, queries, and mutations',
        'Implement resolvers that aggregate from 2-3 REST APIs',
        'Add DataLoader for N+1 query prevention',
        'Write resolver unit tests with mocked data sources',
        'Add Dockerfile for containerized deployment',
        'Document API with example queries in README',
      ],
      evidence_impact: 'Adds GraphQL evidence (currently 0%) and strengthens REST API and Docker scores.',
    },
    {
      title: 'Infrastructure-as-Code Portfolio Deployment',
      description: 'Deploy your best project to AWS using Terraform or CDK. This directly addresses the AWS evidence gap and adds IaC to your profile.',
      tech_stack: ['AWS CDK', 'TypeScript', 'S3', 'CloudFront', 'Lambda', 'RDS'],
      skills_covered: ['AWS', 'CI/CD', 'Docker'],
      estimated_hours: 12,
      difficulty: 'intermediate' as const,
      github_checklist: [
        'Set up AWS CDK project with TypeScript',
        'Define S3 bucket + CloudFront distribution for frontend',
        'Create Lambda function for at least one API endpoint',
        'Set up RDS PostgreSQL instance',
        'Add GitHub Actions deployment workflow',
        'Document architecture with a diagram in README',
      ],
      evidence_impact: 'Raises AWS from 35% (claimed-only) to verified. Strengthens CI/CD evidence.',
    },
    {
      title: 'Open Source Contribution Sprint',
      description: 'Contribute to 2-3 open source projects in your stack. Demonstrates collaboration skills and real-world code quality.',
      tech_stack: ['TypeScript', 'React', 'Node.js'],
      skills_covered: ['Git', 'Testing', 'TypeScript'],
      estimated_hours: 10,
      difficulty: 'beginner' as const,
      github_checklist: [
        'Find 3 repos with "good first issue" labels in React/Node ecosystem',
        'Fork, fix an issue, and submit a well-documented PR',
        'Include tests for your changes',
        'Engage constructively in code review comments',
      ],
      evidence_impact: 'Shows collaboration beyond solo projects. Adds testing evidence in real-world codebases.',
    },
  ];

  const overallScore = 48;
  const verifiedCount = 6;
  const totalSkills = 16;

  const scanRecord = {
    id: scanId,
    user_id: userId,
    target_role: 'Full Stack Engineer',
    github_username: 'demo-user',
    resume_file_path: `${userId}/${scanId}_resume.pdf`,
    linkedin_file_path: `${userId}/${scanId}_linkedin.pdf`,
    resume_text: '[Demo seed — no actual resume text]',
    linkedin_text: '[Demo seed — no actual LinkedIn text]',
    resume_skills: {
      skills: [
        { name: 'TypeScript', category: 'language', confidence: 'explicit' },
        { name: 'React', category: 'framework', confidence: 'explicit' },
        { name: 'Node.js', category: 'framework', confidence: 'explicit' },
        { name: 'PostgreSQL', category: 'tool', confidence: 'explicit' },
        { name: 'Docker', category: 'tool', confidence: 'explicit' },
        { name: 'AWS', category: 'platform', confidence: 'explicit' },
        { name: 'CI/CD', category: 'concept', confidence: 'explicit' },
        { name: 'Testing', category: 'concept', confidence: 'explicit' },
        { name: 'Next.js', category: 'framework', confidence: 'explicit' },
        { name: 'REST APIs', category: 'concept', confidence: 'explicit' },
        { name: 'Tailwind CSS', category: 'framework', confidence: 'explicit' },
        { name: 'Git', category: 'tool', confidence: 'explicit' },
      ],
      experience: [
        { title: 'Software Engineer', company: 'TechCorp', duration: '2 years', description: 'Built full-stack features', skills_used: ['TypeScript', 'React', 'Node.js'] },
      ],
      projects: [
        { name: 'E-commerce Platform', description: 'Full-stack marketplace', tech_stack: ['React', 'Node.js', 'PostgreSQL'] },
      ],
      education: { degree: 'B.S. Computer Science', institution: 'State University', year: '2022', relevant_coursework: ['Data Structures', 'Databases', 'Web Development'] },
      certifications: ['AWS Cloud Practitioner'],
    },
    linkedin_skills: {
      headline: 'Full Stack Engineer | TypeScript | React | Node.js',
      summary: 'Passionate about building scalable web applications.',
      skills: [
        { name: 'TypeScript', endorsement_count: 24, listed_position: 1 },
        { name: 'React', endorsement_count: 18, listed_position: 2 },
        { name: 'Node.js', endorsement_count: 15, listed_position: 3 },
        { name: 'Git', endorsement_count: 12, listed_position: 4 },
        { name: 'Next.js', endorsement_count: 8, listed_position: 5 },
      ],
      experience: [
        { title: 'Software Engineer', company: 'TechCorp', duration: '2 years', description: 'Built user-facing features', skills_mentioned: ['TypeScript', 'React'] },
      ],
      certifications: [{ name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: '2023' }],
      courses: [],
      education: [{ degree: 'B.S. Computer Science', institution: 'State University', year: '2022' }],
      recommendations_count: 3,
      connection_count_range: '500+',
    },
    github_data: {
      username: 'demo-user',
      name: 'Demo User',
      bio: 'Full stack developer. Building things with TypeScript.',
      public_repos: 12,
      followers: 45,
      following: 30,
      account_created: '2020-03-15T00:00:00Z',
      repos: [
        { name: 'ecommerce-app', full_name: 'demo-user/ecommerce-app', description: 'Full-stack e-commerce platform', html_url: 'https://github.com/demo-user/ecommerce-app', language: 'TypeScript', languages: { TypeScript: 65, JavaScript: 20, CSS: 15 }, stargazers_count: 12, forks_count: 3, updated_at: '2025-11-01T00:00:00Z', created_at: '2025-06-01T00:00:00Z', fork: false, size: 4500, file_tree: ['src/', 'src/components/', 'src/pages/', 'src/api/', 'package.json', 'tsconfig.json', 'Dockerfile'], readme_content: '# E-Commerce App\nFull-stack marketplace built with React and Node.js.', code_samples_count: 6 },
        { name: 'portfolio-site', full_name: 'demo-user/portfolio-site', description: 'Personal portfolio with Next.js', html_url: 'https://github.com/demo-user/portfolio-site', language: 'TypeScript', languages: { TypeScript: 80, CSS: 20 }, stargazers_count: 5, forks_count: 1, updated_at: '2025-10-15T00:00:00Z', created_at: '2025-08-01T00:00:00Z', fork: false, size: 2200, file_tree: ['src/', 'src/app/', 'src/components/', 'tailwind.config.ts', 'next.config.js'], readme_content: '# Portfolio\nBuilt with Next.js and Tailwind CSS.', code_samples_count: 4 },
      ],
      aggregate_languages: { TypeScript: 70, JavaScript: 15, CSS: 10, HTML: 5 },
    },
    target_skills: targetSkills,
    evidence_scores: evidenceScores,
    cross_reference_matrix: evidenceScores.map((e) => ({
      skill: e.skill_name,
      ...e.cross_reference,
    })),
    conflicts,
    hidden_skills: hiddenSkills,
    project_recommendations: projects,
    delta_projection: {
      current_readiness: 42,
      projected_readiness: 78,
    },
    gap_summary: 'You have strong frontend fundamentals (TypeScript 88%, React 82%) and solid Git practices (85%), but significant gaps in DevOps and testing discipline. Your resume claims CI/CD and testing experience that isn\'t backed by any GitHub evidence — this is a red flag interviewers will catch. The good news: a single well-structured project with proper tests, a CI pipeline, and Docker setup would address your three biggest gaps simultaneously. Your hidden skills (responsive design, API documentation, monorepo management) are undersold — adding them to your resume is a quick win. Focus on the Task Manager project first for maximum impact.',
    quick_wins: [
      'Add GitHub Actions CI workflow to your top 2 repos (even just lint + build) — takes 30 minutes, immediately adds CI/CD evidence.',
      'Write 10 Jest unit tests for your ecommerce-app API routes — 1-2 hours, removes the testing evidence gap.',
      'Add "Responsive Design" and "API Documentation" to your resume skills section — your GitHub repos already prove these.',
      'Create a docker-compose.yml for your ecommerce-app with PostgreSQL — 45 minutes, strengthens Docker evidence.',
      'Update your LinkedIn skills to include PostgreSQL and Docker, and request endorsements from colleagues.',
    ],
    overall_score: overallScore,
    verified_skill_count: verifiedCount,
    total_target_skills: totalSkills,
    overall_readiness_percentage: 42,
    projected_readiness: 78,
  };

  const { error } = await supabaseAdmin.from('scans').insert(scanRecord);

  if (error) {
    console.error('Failed to insert seed scan:', error);
    process.exit(1);
  }

  console.log(`Seed scan inserted successfully.`);
  console.log(`  Scan ID: ${scanId}`);
  console.log(`  User ID: ${userId}`);
  console.log(`  Role: Full Stack Engineer`);
  console.log(`  Overall Score: ${overallScore}%`);
  console.log(`  Delta: 42% → 78%`);
  console.log(`  Skills: ${totalSkills} (${verifiedCount} verified)`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
