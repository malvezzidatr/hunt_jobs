import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { OAuthProfile, JwtPayload } from './types/auth.types'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthLogin(profile: OAuthProfile) {
    const { provider, providerId, email, name, avatar } = profile

    let user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          avatar: avatar || user.avatar,
          provider,
          providerId,
        },
      })
      this.logger.log(`User logged in: ${email} via ${provider}`)
    } else {
      user = await this.prisma.user.create({
        data: { email, name, avatar, provider, providerId },
      })
      this.logger.log(`New user created: ${email} via ${provider}`)
    }

    return user
  }

  generateJwt(user: { id: string; email: string; name: string | null }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    }
    return this.jwtService.sign(payload)
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { techProfile: true },
    })
  }
}
