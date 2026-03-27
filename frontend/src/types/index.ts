// User types
export interface User {
  id: string;
  email: string;
  name: string;
}

// Scan types (populated in later phases — defined here for consistency)
export interface Skill {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'platform' | 'concept';
  confidence: 'explicit' | 'inferred';
}

export interface EvidenceEntry {
  skill: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  resume_found: boolean;
  linkedin_found: boolean;
  linkedin_endorsements: number;
  github_score: number;
  overall_score: number;
  status: 'fully_verified' | 'claimed_unproven' | 'underreported' | 'hidden_skill' | 'suspicious' | 'undiscovered' | 'social_only' | 'missing';
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  tech_stack: string[];
  skills_covered: string[];
  estimated_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  github_checklist: string[];
  evidence_impact: string;
}

export interface Conflict {
  skill: string;
  issue: string;
  risk_level: 'high' | 'medium' | 'low';
  action: string;
}

export interface ScanResult {
  id: string;
  target_role: string;
  overall_score: number;
  verified_skill_count: number;
  total_target_skills: number;
  evidence_matrix: EvidenceEntry[];
  conflicts: Conflict[];
  hidden_skills: { skill: string; found_on: string[]; action: string }[];
  project_recommendations: ProjectRecommendation[];
  delta_projection: {
    current_readiness: number;
    projected_readiness: number;
  };
  gap_summary: string;
  quick_wins: string[];
  created_at: string;
}

export interface ScanSummary {
  id: string;
  target_role: string;
  overall_score: number;
  verified_skill_count: number;
  total_target_skills: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  scan_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}
