import { IsString, IsOptional, IsBoolean, IsIn, IsArray } from 'class-validator';

const JOB_LEVELS = ['ESTAGIO', 'JUNIOR', 'PLENO'] as const;
const JOB_TYPES = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'MOBILE'] as const;

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  description: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsIn(JOB_LEVELS)
  level: string;

  @IsIn(JOB_TYPES)
  type: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsString()
  sourceId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  postedAt?: Date;
}
