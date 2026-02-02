export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  recommendation: 'APLICAR' | 'MELHORAR' | 'NAO_RECOMENDADO';
}
