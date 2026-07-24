import { describe, expect, it, vi } from 'vitest';
import { PrismaChannelRepository } from '@/infrastructure/db/PrismaChannelRepository';
import type { PrismaClient } from '@/generated/prisma/client';

function createMockPrisma() {
  return {
    channel: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  } as unknown as PrismaClient;
}

const baseRecord = {
  id: 'chan_1',
  userId: 'user_1',
  platformType: 'YOUTUBE',
  externalChannelId: 'yt_123',
  displayName: 'テストチャンネル',
  accessTokenEnc: 'enc_access',
  refreshTokenEnc: 'enc_refresh',
  tokenExpiresAt: new Date('2026-08-01T00:00:00Z'),
  isActive: true,
  status: 'CONNECTED',
  connectedAt: new Date('2026-07-01T00:00:00Z'),
};

describe('PrismaChannelRepository', () => {
  it('findActiveChannels: isActive=true かつ status=CONNECTEDのみ取得する', async () => {
    const prisma = createMockPrisma();
    (prisma.channel.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([baseRecord]);

    const repo = new PrismaChannelRepository(prisma);
    const result = await repo.findActiveChannels();

    expect(prisma.channel.findMany).toHaveBeenCalledWith({
      where: { isActive: true, status: 'CONNECTED' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('chan_1');
  });

  it('upsertConnection: platformTypeとexternalChannelIdの複合キーでupsertする', async () => {
    const prisma = createMockPrisma();
    (prisma.channel.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(baseRecord);

    const repo = new PrismaChannelRepository(prisma);
    await repo.upsertConnection({
      userId: 'user_1',
      platformType: 'YOUTUBE',
      externalChannelId: 'yt_123',
      displayName: 'テストチャンネル',
      accessTokenEnc: 'enc_access',
      refreshTokenEnc: 'enc_refresh',
      tokenExpiresAt: new Date('2026-08-01T00:00:00Z'),
    });

    expect(prisma.channel.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          platformType_externalChannelId: {
            platformType: 'YOUTUBE',
            externalChannelId: 'yt_123',
          },
        },
      }),
    );
  });

  it('disconnect: isActive=false かつ status=DISCONNECTEDへ更新する', async () => {
    const prisma = createMockPrisma();
    (prisma.channel.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseRecord,
      isActive: false,
      status: 'DISCONNECTED',
    });

    const repo = new PrismaChannelRepository(prisma);
    await repo.disconnect('chan_1');

    expect(prisma.channel.update).toHaveBeenCalledWith({
      where: { id: 'chan_1' },
      data: { isActive: false, status: 'DISCONNECTED' },
    });
  });

  it('updateStatus: 指定したstatusのみを更新する', async () => {
    const prisma = createMockPrisma();
    (prisma.channel.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseRecord,
      status: 'REAUTH_REQUIRED',
    });

    const repo = new PrismaChannelRepository(prisma);
    await repo.updateStatus('chan_1', 'REAUTH_REQUIRED');

    expect(prisma.channel.update).toHaveBeenCalledWith({
      where: { id: 'chan_1' },
      data: { status: 'REAUTH_REQUIRED' },
    });
  });
});
