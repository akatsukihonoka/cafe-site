import type { PrismaClient } from '@/generated/prisma/client';
import type { Channel, ChannelStatus } from '@/domain/entities/Channel';
import type {
  ChannelConnectionInput,
  ChannelRepository,
  ChannelTokens,
} from '@/domain/ports/ChannelRepository';

interface ChannelRecord {
  id: string;
  userId: string;
  platformType: string;
  externalChannelId: string;
  displayName: string;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  tokenExpiresAt: Date;
  isActive: boolean;
  status: string;
  connectedAt: Date;
}

function toDomain(record: ChannelRecord): Channel {
  return {
    id: record.id,
    userId: record.userId,
    platformType: record.platformType as Channel['platformType'],
    externalChannelId: record.externalChannelId,
    displayName: record.displayName,
    accessTokenEnc: record.accessTokenEnc,
    refreshTokenEnc: record.refreshTokenEnc,
    tokenExpiresAt: record.tokenExpiresAt,
    isActive: record.isActive,
    status: record.status as ChannelStatus,
    connectedAt: record.connectedAt,
  };
}

export class PrismaChannelRepository implements ChannelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Channel | null> {
    const record = await this.prisma.channel.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Channel[]> {
    const records = await this.prisma.channel.findMany({ where: { userId } });
    return records.map(toDomain);
  }

  async findActiveChannels(): Promise<Channel[]> {
    const records = await this.prisma.channel.findMany({
      where: { isActive: true, status: 'CONNECTED' },
    });
    return records.map(toDomain);
  }

  async upsertConnection(input: ChannelConnectionInput): Promise<Channel> {
    const record = await this.prisma.channel.upsert({
      where: {
        platformType_externalChannelId: {
          platformType: input.platformType,
          externalChannelId: input.externalChannelId,
        },
      },
      create: {
        userId: input.userId,
        platformType: input.platformType,
        externalChannelId: input.externalChannelId,
        displayName: input.displayName,
        accessTokenEnc: input.accessTokenEnc,
        refreshTokenEnc: input.refreshTokenEnc,
        tokenExpiresAt: input.tokenExpiresAt,
        isActive: true,
        status: 'CONNECTED',
      },
      update: {
        displayName: input.displayName,
        accessTokenEnc: input.accessTokenEnc,
        refreshTokenEnc: input.refreshTokenEnc,
        tokenExpiresAt: input.tokenExpiresAt,
        isActive: true,
        status: 'CONNECTED',
      },
    });
    return toDomain(record);
  }

  async updateStatus(id: string, status: ChannelStatus): Promise<void> {
    await this.prisma.channel.update({ where: { id }, data: { status } });
  }

  async updateTokens(id: string, tokens: ChannelTokens): Promise<void> {
    await this.prisma.channel.update({
      where: { id },
      data: {
        accessTokenEnc: tokens.accessTokenEnc,
        refreshTokenEnc: tokens.refreshTokenEnc,
        tokenExpiresAt: tokens.tokenExpiresAt,
      },
    });
  }

  async disconnect(id: string): Promise<void> {
    await this.prisma.channel.update({
      where: { id },
      data: { isActive: false, status: 'DISCONNECTED' },
    });
  }
}
