import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por periodo',
    enum: ['7d', '30d', '90d'],
    default: '30d',
  })
  @IsOptional()
  @IsString()
  period?: '7d' | '30d' | '90d';

  @ApiPropertyOptional({
    description: 'Filtrar por nivel',
    enum: ['ESTAGIO', 'JUNIOR', 'ALL'],
    default: 'ALL',
  })
  @IsOptional()
  @IsString()
  level?: 'ESTAGIO' | 'JUNIOR' | 'ALL';
}
