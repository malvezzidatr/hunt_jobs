import type { SkillBadgeVariant, SkillResource, ResourceType } from '@malvezzidatr/zev-react'

// Model Types (dados da API)
export interface Resource {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'course' | 'article' | 'practice';
  free: boolean;
}

export interface TechPath {
  name: string;
  icon: string;
  priority: 'essencial' | 'importante' | 'diferencial';
  whyNeeded: string;
  whatToFocus: string;
  resources: Resource[];
}

export interface ProjectIdea {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
}

export interface StudyStrategy {
  order: string;
  dailyHours: string;
  approach: string;
}

export interface LearningPathResponse {
  technologies: TechPath[];
  projectIdeas: ProjectIdea[];
  studyStrategy: StudyStrategy;
  generalTips: string[];
  estimatedStudyTime: string;
}

// Props do componente
export interface LearningPathProps {
  jobId: string;
}

// Helpers para mapear dados da API para ZevSkillCard
export function mapPriorityToBadge(priority: TechPath['priority']): SkillBadgeVariant {
  const mapping: Record<TechPath['priority'], SkillBadgeVariant> = {
    essencial: 'required',
    importante: 'differential',
    diferencial: 'optional',
  }
  return mapping[priority]
}

export function mapResourceType(type: Resource['type']): ResourceType {
  if (type === 'practice') return 'article'
  return type as ResourceType
}

export function mapResourcesToSkillResources(resources: Resource[]): SkillResource[] {
  return resources.map(r => ({
    label: r.title,
    url: r.url,
    type: mapResourceType(r.type),
  }))
}

// ViewModel State
export interface LearningPathState {
  data: LearningPathResponse | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  expandedCard: string | null;
  hasData: boolean;
  techCount: number;
}

// ViewModel Actions
export interface LearningPathActions {
  onGenerate: () => Promise<void>;
  onToggleCard: (techName: string) => void;
}

// ViewModel Return Type
export type LearningPathViewModel = LearningPathState & LearningPathActions;
