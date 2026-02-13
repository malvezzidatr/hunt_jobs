import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ApplicationsService } from './applications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '../auth/types/auth.types'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  private readonly logger = new Logger(ApplicationsController.name)

  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista candidaturas do usuario' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.applicationsService.findAll(user.id)
    return { data }
  }

  @Post()
  @ApiOperation({ summary: 'Salva uma vaga no tracker' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateApplicationDto,
  ) {
    const application = await this.applicationsService.create(user.id, dto)
    this.logger.log(`User ${user.email} saved job ${dto.jobId} to tracker`)
    return application
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza status ou notas de uma candidatura' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    const application = await this.applicationsService.update(user.id, id, dto)
    this.logger.log(`User ${user.email} updated application ${id}`)
    return application
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma candidatura do tracker' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.applicationsService.remove(user.id, id)
    this.logger.log(`User ${user.email} removed application ${id}`)
    return { message: 'Candidatura removida' }
  }
}
