import { NextResponse } from 'next/server';
import {
  BriefingNotAuthorizedError,
  RegenerateRateLimitedError,
  regenerateMyBriefing,
} from '@/application/services/briefingService';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { channelId } = await params;

  try {
    const briefing = await regenerateMyBriefing(channelId);
    return NextResponse.json({ briefing });
  } catch (error) {
    if (error instanceof BriefingNotAuthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof RegenerateRateLimitedError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
