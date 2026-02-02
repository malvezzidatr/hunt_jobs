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

export interface GenerateLearningPathDto {
  jobId: string;
}
