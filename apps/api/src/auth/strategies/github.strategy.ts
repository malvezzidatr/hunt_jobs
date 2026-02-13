import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { AuthService } from '../auth.service'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET', ''),
      callbackURL:
        configService.get<string>('BACKEND_URL', 'http://localhost:3000') +
        '/auth/github/callback',
      scope: ['user:email'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: any,
  ) {
    const email =
      profile.emails?.[0]?.value || `${profile.username}@github.noemail`

    const user = await this.authService.validateOAuthLogin({
      provider: 'github',
      providerId: String(profile.id),
      email,
      name: profile.displayName || profile.username || null,
      avatar: profile.photos?.[0]?.value || null,
    })
    done(null, user)
  }
}
