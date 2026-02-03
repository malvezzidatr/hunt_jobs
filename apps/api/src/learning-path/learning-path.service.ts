import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Groq from 'groq-sdk';
import { JobsService } from '../jobs/jobs.service';
import { LearningPathResponse } from './dto/learning-path.dto';
import { getResourcesForTech } from './curated-resources';

@Injectable()
export class LearningPathService {
  private readonly logger = new Logger(LearningPathService.name);
  private groq: Groq;

  constructor(private jobsService: JobsService) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not configured');
      return;
    }
    this.groq = new Groq({ apiKey });
  }

  async generate(jobId: string): Promise<LearningPathResponse> {
    if (!this.groq) {
      throw new Error('Groq API not configured. Set GROQ_API_KEY environment variable.');
    }

    const job = await this.jobsService.findOne(jobId);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    const prompt = `
Você é um mentor de carreira especializado em tecnologia, focado em ajudar estagiários e juniores no Brasil.

VAGA:
Título: ${job.title}
Empresa: ${job.company}
Descrição: ${job.description}

Analise esta vaga e identifique as tecnologias/habilidades necessárias.
Para cada tecnologia, forneça orientação CONTEXTUALIZADA para esta vaga específica.

Retorne APENAS um JSON válido (sem markdown, sem backticks) com este formato exato:
{
  "technologies": [
    {
      "name": "NomeDaTecnologia",
      "priority": "essencial",
      "whyNeeded": "Explicação de por que ESTA VAGA precisa desta tech (2-3 frases)",
      "whatToFocus": "O que o candidato deve focar para se preparar (3-4 tópicos específicos)"
    }
  ],
  "projectIdeas": [
    {
      "title": "Nome do projeto",
      "description": "Descrição curta do projeto que usa as tecnologias da vaga",
      "technologies": ["React", "Node.js"],
      "difficulty": "iniciante"
    }
  ],
  "studyStrategy": {
    "order": "Ordem sugerida para estudar (ex: 'Comece por JavaScript, depois React, então Node.js')",
    "dailyHours": "2-3 horas",
    "approach": "Dica de como estudar efetivamente (ex: 'Alterne entre teoria e prática')"
  },
  "generalTips": [
    "Dica prática e específica para esta vaga"
  ],
  "estimatedStudyTime": "X-Y meses"
}

REGRAS IMPORTANTES:
- Máximo 6 tecnologias, ordenadas por prioridade (essencial primeiro)
- priority deve ser: "essencial", "importante" ou "diferencial"
- ATENÇÃO com linguagens alternativas: Quando a vaga diz "uma ou mais", "qualquer uma", "X ou Y ou Z", significa que o candidato precisa saber APENAS UMA delas, não todas. Nesse caso, escolha a mais popular/fácil de aprender como "essencial" e marque as outras como "diferencial"
- CRÍTICO: Use APENAS nomes de tecnologias específicas e padronizadas. Exemplos corretos:
  * Mobile: "React Native", "Flutter", "Kotlin", "Swift" (NÃO use "Desenvolvimento Mobile")
  * Backend: "Node.js", "Python", "Java", "Spring", "NestJS" (NÃO use "Backend Development")
  * Banco de dados: "PostgreSQL", "MySQL", "MongoDB", "Redis" (NÃO use "Banco de Dados Relacional")
  * APIs: "API REST", "GraphQL" (NÃO use "APIs RESTful" ou "Desenvolvimento de APIs")
  * Testes: "Jest", "Cypress", "Vitest" (NÃO use "Testes Automatizados")
  * Cloud: "AWS", "Azure", "Docker", "Kubernetes" (NÃO use "Cloud Computing")
  * Frontend: "React", "Vue", "Angular", "Next.js" (NÃO use "Frontend Development")
- Se a vaga menciona uma categoria genérica, identifique a tecnologia específica mais provável
- projectIdeas: 2-3 projetos práticos CRIATIVOS e VARIADOS que o candidato pode construir. EVITE sugestões genéricas como "Clone do Twitter" ou "App de tarefas". Exemplos por área:
  * Frontend: Dashboard de métricas, Portfolio interativo, Quiz game, Galeria de fotos com filtros, Calculadora de orçamento
  * Backend: API de encurtador de URLs, Sistema de agendamentos, Microserviço de notificações, API de clima com cache
  * Fullstack: Blog com CMS, Plataforma de cursos, Sistema de delivery, Rede social de nicho (pets, livros, música)
  * Mobile: App de hábitos, Leitor de QR code, App de receitas, Rastreador de despesas
  * Data: Dashboard de dados públicos, Bot de Telegram, Scraper de preços, Análise de sentimentos
- difficulty dos projetos: "iniciante", "intermediário" ou "avançado"
- studyStrategy: ordem lógica de estudo e dicas práticas de como aprender
- generalTips: 3-4 dicas práticas e acionáveis (não genéricas)
- Seja específico para ESTA vaga, não genérico
- Responda APENAS com o JSON, sem texto adicional
`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 2048,
      });

      const response = completion.choices[0]?.message?.content || '';

      // Remove possíveis backticks ou markdown
      const cleanJson = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      // Validar estrutura básica
      if (!Array.isArray(parsed.technologies)) {
        throw new Error('Invalid response structure');
      }

      const validPriorities = ['essencial', 'importante', 'diferencial'] as const;

      return {
        technologies: parsed.technologies.slice(0, 6).map((tech: any) => {
          const techName = tech.name || 'Tecnologia';
          // Buscar recursos curados para esta tecnologia
          const curatedResources = getResourcesForTech(techName);

          return {
            name: techName,
            icon: tech.icon || techName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '') || 'code',
            priority: validPriorities.includes(tech.priority)
              ? (tech.priority as 'essencial' | 'importante' | 'diferencial')
              : 'importante',
            whyNeeded: tech.whyNeeded || '',
            whatToFocus: tech.whatToFocus || '',
            resources: curatedResources.slice(0, 4),
          };
        }),
        projectIdeas: Array.isArray(parsed.projectIdeas)
          ? parsed.projectIdeas.slice(0, 3).map((project: any) => ({
              title: project.title || 'Projeto',
              description: project.description || '',
              technologies: Array.isArray(project.technologies) ? project.technologies : [],
              difficulty: ['iniciante', 'intermediário', 'avançado'].includes(project.difficulty)
                ? project.difficulty
                : 'iniciante',
            }))
          : [],
        studyStrategy: {
          order: parsed.studyStrategy?.order || 'Estude na ordem das tecnologias listadas acima',
          dailyHours: parsed.studyStrategy?.dailyHours || '2-3 horas',
          approach: parsed.studyStrategy?.approach || 'Alterne entre teoria (30%) e prática (70%)',
        },
        generalTips: Array.isArray(parsed.generalTips)
          ? parsed.generalTips.slice(0, 4)
          : [],
        estimatedStudyTime: parsed.estimatedStudyTime || '2-4 meses',
      };
    } catch (error) {
      this.logger.error('Error generating learning path with Groq', error);
      throw new Error('Erro ao gerar trilha de aprendizado. Tente novamente.');
    }
  }
}
