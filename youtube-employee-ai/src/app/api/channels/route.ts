import { NextResponse } from 'next/server';
import { listMyChannels } from '@/application/services/channelService';

export async function GET() {
  const channels = await listMyChannels();
  return NextResponse.json({ channels });
}
