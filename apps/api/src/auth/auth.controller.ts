import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { GithubAuthGuard } from './guards/github-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import { AuthenticatedUser } from './types/auth.types'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Inicia login via Google OAuth' })
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any
    const token = this.authService.generateJwt(user)
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    )
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Inicia login via GitHub OAuth' })
  githubLogin() {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Callback do GitHub OAuth' })
  githubCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any
    const token = this.authService.generateJwt(user)
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    )
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna dados do usuario autenticado' })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    const fullUser = await this.authService.getUserById(user.id)
    if (!fullUser) {
      return null
    }
    return {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      avatar: fullUser.avatar,
      provider: fullUser.provider,
      createdAt: fullUser.createdAt,
    }
  }
}
