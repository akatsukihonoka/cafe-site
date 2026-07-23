import type { ChannelRepository } from '@/domain/ports/ChannelRepository';

export interface DisconnectChannelInput {
  userId: string;
  channelId: string;
}

export class DisconnectChannelUsecase {
  constructor(private readonly channelRepository: ChannelRepository) {}

  async execute(input: DisconnectChannelInput): Promise<void> {
    const channel = await this.channelRepository.findById(input.channelId);
    if (!channel || channel.userId !== input.userId) {
      throw new Error('Channel not found');
    }
    await this.channelRepository.disconnect(input.channelId);
  }
}
