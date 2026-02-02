import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { AnalysisResult } from './dto/analyze-resume.dto';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private groq: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not configured');
      return;
    }
    this.groq = new Groq({ apiKey });
  }

  async analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
    if (!this.groq) {
      throw new Error('Groq API not configured. Set GROQ_API_KEY environment variable.');
    }

    const prompt = `
Você é um especialista em ATS (Applicant Tracking System) e recrutamento tech no Brasil.

VAGA:
${jobDescription}

CURRÍCULO:
${resumeText}

Analise a compatibilidade entre o currículo e a vaga. Considere:
- Habilidades técnicas mencionadas
- Experiência relevante
- Palavras-chave da vaga presentes no currículo
- Nível de senioridade compatível

Retorne APENAS um JSON válido (sem markdown, sem backticks) com esta estrutura:
{
  "score": <número de 0 a 100>,
  "summary": "<resumo em 2-3 frases da compatibilidade>",
  "strengths": ["<ponto forte 1>", "<ponto forte 2>"],
  "improvements": ["<sugestão de melhoria 1>", "<sugestão 2>"],
  "missingKeywords": ["<keyword da vaga não encontrada 1>", "<keyword 2>"],
  "recommendation": "<APLICAR | MELHORAR | NAO_RECOMENDADO>"
}

Critérios de recomendação:
- APLICAR: score >= 70
- MELHORAR: score entre 40 e 69
- NAO_RECOMENDADO: score < 40
`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content || '';

      // Remove possíveis backticks ou markdown que a IA possa adicionar
      const cleanJson = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      // Validar estrutura básica
      if (typeof parsed.score !== 'number' || !parsed.summary) {
        throw new Error('Invalid response structure');
      }

      return {
        score: Math.min(100, Math.max(0, parsed.score)),
        summary: parsed.summary,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        missingKeywords: parsed.missingKeywords || [],
        recommendation: parsed.recommendation || this.getRecommendation(parsed.score),
      };
    } catch (error) {
      this.logger.error('Error analyzing resume with Groq', error);
      throw new Error('Erro ao analisar currículo. Tente novamente.');
    }
  }

  private getRecommendation(score: number): 'APLICAR' | 'MELHORAR' | 'NAO_RECOMENDADO' {
    if (score >= 70) return 'APLICAR';
    if (score >= 40) return 'MELHORAR';
    return 'NAO_RECOMENDADO';
  }
}
