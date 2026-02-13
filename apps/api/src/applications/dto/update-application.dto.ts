import { IsString, IsOptional, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

const APPLICATION_STATUSES = [
  'SAVED',
  'APPLIED',
  'TECHNICAL_TEST',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const

export class UpdateApplicationDto {
  @ApiPropertyOptional({
    description: 'Novo status da candidatura',
    enum: APPLICATION_STATUSES,
  })
  @IsOptional()
  @IsIn(APPLICATION_STATUSES)
  status?: string

  @ApiPropertyOptional({ description: 'Notas atualizadas' })
  @IsOptional()
  @IsString()
  notes?: string
}
