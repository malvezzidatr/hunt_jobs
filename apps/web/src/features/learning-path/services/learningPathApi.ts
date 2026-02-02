import { fetchAPI } from '../../../shared/services/api';
import type { LearningPathResponse } from '../components/LearningPath/LearningPath.types';

export async function generateLearningPath(jobId: string): Promise<LearningPathResponse> {
  return fetchAPI<LearningPathResponse>('/learning-path/generate', {
    method: 'POST',
    body: JSON.stringify({ jobId }),
  });
}
