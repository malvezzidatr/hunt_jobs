import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getTechs(userId: string): Promise<string[]> {
    const profile = await this.prisma.userTechProfile.findUnique({
      where: { userId },
    })
    if (!profile) return []
    return JSON.parse(profile.techs) as string[]
  }

  async updateTechs(userId: string, techs: string[]): Promise<string[]> {
    const normalized = techs
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean)
    const techsJson = JSON.stringify(normalized)

    await this.prisma.userTechProfile.upsert({
      where: { userId },
      create: { userId, techs: techsJson },
      update: { techs: techsJson },
    })

    return normalized
  }
}
