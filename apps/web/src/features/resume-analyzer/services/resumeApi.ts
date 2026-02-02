import { API_URL } from '../../../shared/services/api';
import type { AnalysisResult } from '../types/resume.types';

export async function analyzeResume(file: File, jobId: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobId', jobId);

  const response = await fetch(`${API_URL}/resume/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao analisar currículo' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}
