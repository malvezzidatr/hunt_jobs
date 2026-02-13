export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  recommendation: 'APLICAR' | 'MELHORAR' | 'NAO_RECOMENDADO';
}

export interface OptimizationResult {
  optimizedSummary: string;
  bulletPoints: { original: string; optimized: string; reason: string }[];
  keywordsToAdd: { keyword: string; suggestion: string }[];
  sectionTips: { section: string; tip: string }[];
  generalScore: number;
  potentialScore: number;
}
