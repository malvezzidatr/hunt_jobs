import { Controller, Get, Put, Body, UseGuards, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ProfileService } from './profile.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '../auth/types/auth.types'
import { UpdateTechsDto } from './dto/update-techs.dto'

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name)

  constructor(private readonly profileService: ProfileService) {}

  @Get('techs')
  @ApiOperation({ summary: 'Retorna tecnologias do perfil do usuario' })
  async getTechs(@CurrentUser() user: AuthenticatedUser) {
    const techs = await this.profileService.getTechs(user.id)
    return { techs }
  }

  @Put('techs')
  @ApiOperation({ summary: 'Atualiza tecnologias do perfil do usuario' })
  async updateTechs(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTechsDto,
  ) {
    const techs = await this.profileService.updateTechs(user.id, dto.techs)
    this.logger.log(
      `User ${user.email} updated tech profile: ${techs.length} techs`,
    )
    return { techs }
  }
}
