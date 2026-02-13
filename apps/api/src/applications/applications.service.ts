import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'

const JOB_INCLUDE = {
  source: true,
  tags: { include: { tag: true } },
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const applications = await this.prisma.applicationTrack.findMany({
      where: { userId },
      include: { job: { include: JOB_INCLUDE } },
      orderBy: { updatedAt: 'desc' },
    })

    return applications.map((app) => ({
      ...app,
      job: {
        ...app.job,
        tags: app.job.tags.map((jt) => jt.tag),
      },
    }))
  }

  async create(userId: string, dto: CreateApplicationDto) {
    const application = await this.prisma.applicationTrack.upsert({
      where: {
        userId_jobId: { userId, jobId: dto.jobId },
      },
      create: {
        userId,
        jobId: dto.jobId,
        status: dto.status || 'SAVED',
        notes: dto.notes || null,
        appliedAt: dto.status === 'APPLIED' ? new Date() : null,
      },
      update: {},
      include: { job: { include: JOB_INCLUDE } },
    })

    return {
      ...application,
      job: {
        ...application.job,
        tags: application.job.tags.map((jt) => jt.tag),
      },
    }
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    const existing = await this.prisma.applicationTrack.findUnique({
      where: { id },
    })

    if (!existing) throw new NotFoundException('Candidatura nao encontrada')
    if (existing.userId !== userId) throw new ForbiddenException()

    const data: Record<string, unknown> = {}
    if (dto.status !== undefined) {
      data.status = dto.status
      if (dto.status === 'APPLIED' && !existing.appliedAt) {
        data.appliedAt = new Date()
      }
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes
    }

    const application = await this.prisma.applicationTrack.update({
      where: { id },
      data,
      include: { job: { include: JOB_INCLUDE } },
    })

    return {
      ...application,
      job: {
        ...application.job,
        tags: application.job.tags.map((jt) => jt.tag),
      },
    }
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.applicationTrack.findUnique({
      where: { id },
    })

    if (!existing) throw new NotFoundException('Candidatura nao encontrada')
    if (existing.userId !== userId) throw new ForbiddenException()

    await this.prisma.applicationTrack.delete({ where: { id } })
  }
}
