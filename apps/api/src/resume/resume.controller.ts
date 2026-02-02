import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ResumeService } from './resume.service';
import { GeminiService } from './gemini.service';
import { JobsService } from '../jobs/jobs.service';

@ApiTags('resume')
@Controller('resume')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly geminiService: GeminiService,
    private readonly jobsService: JobsService,
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analisa compatibilidade do currículo com uma vaga' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        jobId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Apenas arquivos PDF são aceitos'), false);
        }
        cb(null, true);
      },
    }),
  )
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('jobId') jobId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório');
    }

    if (!jobId) {
      throw new BadRequestException('ID da vaga é obrigatório');
    }

    // Buscar dados da vaga
    const job = await this.jobsService.findOne(jobId);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    // Extrair texto do PDF
    const resumeText = await this.resumeService.extractTextFromPDF(file.buffer);

    // Montar descrição completa da vaga
    const jobDescription = `
Título: ${job.title}
Empresa: ${job.company}
Nível: ${job.level}
Tipo: ${job.type}
${job.remote ? 'Remoto' : 'Presencial'}
${job.location ? `Localização: ${job.location}` : ''}
${job.tags.length > 0 ? `Tecnologias: ${job.tags.map(t => t.name).join(', ')}` : ''}

Descrição:
${job.description}
`;

    // Analisar com Gemini
    const analysis = await this.geminiService.analyzeResume(resumeText, jobDescription);

    return analysis;
  }
}
