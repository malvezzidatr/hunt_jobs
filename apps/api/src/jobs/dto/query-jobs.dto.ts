import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryJobsDto {
  @ApiPropertyOptional({ description: 'Busca por texto no título, empresa ou descrição' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Níveis separados por vírgula (ESTAGIO, JUNIOR, PLENO)' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Tipos separados por vírgula (FRONTEND, BACKEND, FULLSTACK, MOBILE)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filtrar por vagas remotas' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  remote?: boolean;

  @ApiPropertyOptional({ description: 'IDs das fontes separados por vírgula (GitHub, LinkedIn, etc.)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'IDs das tags separados por vírgula' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'IDs das vagas separados por vírgula (para favoritos)' })
  @IsOptional()
  @IsString()
  ids?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por período',
    enum: ['24h', '7d', '30d']
  })
  @IsOptional()
  @IsString()
  period?: '24h' | '7d' | '30d';

  @ApiPropertyOptional({ description: 'Tecnologias do usuário separadas por vírgula (para sort por match)' })
  @IsOptional()
  @IsString()
  techs?: string;

  @ApiPropertyOptional({
    description: 'Ordenação',
    enum: ['recent', 'oldest', 'match'],
    default: 'recent'
  })
  @IsOptional()
  @IsString()
  sort?: 'recent' | 'oldest' | 'match';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
