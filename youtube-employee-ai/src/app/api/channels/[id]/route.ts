import { NextResponse } from 'next/server';
import { disconnectMyChannel } from '@/application/services/channelService';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await disconnectMyChannel(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }
}
