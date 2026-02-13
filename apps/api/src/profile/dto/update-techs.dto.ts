import { IsArray, IsString, ArrayMaxSize } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateTechsDto {
  @ApiProperty({
    description: 'Array de tecnologias do usuario',
    example: ['react', 'typescript', 'node'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  techs: string[]
}
