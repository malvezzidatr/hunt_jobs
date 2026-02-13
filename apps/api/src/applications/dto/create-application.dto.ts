import { IsString, IsOptional, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const APPLICATION_STATUSES = [
  'SAVED',
  'APPLIED',
  'TECHNICAL_TEST',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const

export class CreateApplicationDto {
  @ApiProperty({ description: 'ID da vaga' })
  @IsString()
  jobId: string

  @ApiPropertyOptional({
    description: 'Status inicial da candidatura',
    enum: APPLICATION_STATUSES,
    default: 'SAVED',
  })
  @IsOptional()
  @IsIn(APPLICATION_STATUSES)
  status?: string

  @ApiPropertyOptional({ description: 'Notas sobre a candidatura' })
  @IsOptional()
  @IsString()
  notes?: string
}
