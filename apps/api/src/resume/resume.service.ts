import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text
        .replace(/\s+/g, ' ')
        .trim();

      if (!text || text.length < 50) {
        throw new Error('Não foi possível extrair texto do PDF. O arquivo pode estar corrompido ou conter apenas imagens.');
      }

      this.logger.log(`Extracted ${text.length} characters from PDF`);
      return text;
    } catch (error) {
      this.logger.error('Error extracting text from PDF', error);
      if (error.message?.includes('imagens')) {
        throw error;
      }
      throw new Error('Erro ao processar o PDF. Verifique se o arquivo é válido.');
    }
  }
}
